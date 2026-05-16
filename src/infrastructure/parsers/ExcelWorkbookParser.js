import { Indicator } from "../../core/domain/entities/Indicator.js";
import { SemaphorePolicy } from "../../core/domain/services/SemaphorePolicy.js";

const HEADER_KEYS = {
  code: ["codigo", "cod", "id_indicador", "id"],
  name: ["indicador", "nombre_indicador", "nombre", "descripcion"],
  area: ["area", "servicio", "proceso", "macroproceso"],
  objective: ["objetivo", "objetivo_estrategico", "obj"],
  processId: ["id_proceso", "proceso_id", "codigo_proceso"],
  frequency: ["frecuencia", "periodicidad"],
  source: ["fuente", "origen", "source"],
  unit: ["unidad", "unidad_medida", "medida"],
  value: ["valor", "resultado", "dato", "actual"],
  target: ["meta", "objetivo_valor", "meta_valor", "target"],
  status: ["semaforo", "estado", "status", "clasificacion"],
  direction: ["direccion", "sentido", "regla"],
  period: ["fecha", "periodo", "mes", "corte"],
};

function normalizeHeader(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getColumnName(headers, aliases) {
  const normalized = headers.map((header) => normalizeHeader(header));

  for (const alias of aliases) {
    const key = normalizeHeader(alias);
    const index = normalized.findIndex((header) => header === key || header.includes(key));
    if (index >= 0) {
      return headers[index];
    }
  }

  return null;
}

function normalizeDirection(direction) {
  const normalized = String(direction ?? "").trim().toLowerCase();
  if (["max", "maximo", "mayor_mejor", "alto_mejor"].includes(normalized)) {
    return "max";
  }

  return "min";
}

function parsePeriod(raw) {
  if (!raw && raw !== 0) {
    return "Sin fecha";
  }

  if (typeof raw === "number") {
    const parsed = new Date(Math.round((raw - 25569) * 86400 * 1000));
    return Number.isNaN(parsed.getTime()) ? "Sin fecha" : parsed.toISOString().slice(0, 10);
  }

  const candidate = String(raw).trim();
  const dateCandidate = new Date(candidate);
  if (Number.isNaN(dateCandidate.getTime())) {
    return candidate || "Sin fecha";
  }

  return dateCandidate.toISOString().slice(0, 10);
}

function parseValue(raw) {
  return SemaphorePolicy.sanitizeNumber(raw);
}

export class ExcelWorkbookParser {
  constructor(xlsxLibrary) {
    this.xlsx = xlsxLibrary;
  }

  async parse(file) {
    if (!this.xlsx) {
      throw new Error("No se encontro la libreria XLSX en la pagina.");
    }

    const buffer = await file.arrayBuffer();
    const workbook = this.xlsx.read(buffer, { type: "array" });
    const rows = this._collectRows(workbook);

    if (!rows.length) {
      return [];
    }

    const headers = Object.keys(rows[0]);
    const columns = {
      code: getColumnName(headers, HEADER_KEYS.code),
      name: getColumnName(headers, HEADER_KEYS.name),
      area: getColumnName(headers, HEADER_KEYS.area),
      objective: getColumnName(headers, HEADER_KEYS.objective),
      processId: getColumnName(headers, HEADER_KEYS.processId),
      frequency: getColumnName(headers, HEADER_KEYS.frequency),
      source: getColumnName(headers, HEADER_KEYS.source),
      unit: getColumnName(headers, HEADER_KEYS.unit),
      value: getColumnName(headers, HEADER_KEYS.value),
      target: getColumnName(headers, HEADER_KEYS.target),
      status: getColumnName(headers, HEADER_KEYS.status),
      direction: getColumnName(headers, HEADER_KEYS.direction),
      period: getColumnName(headers, HEADER_KEYS.period),
    };

    if (!columns.name || !columns.value) {
      throw new Error("No se detectaron columnas minimas. Requiere al menos nombre de indicador y valor.");
    }

    const seriesByIndicator = new Map();
    const latestByIndicator = new Map();

    rows.forEach((row, index) => {
      const name = String(row[columns.name] ?? "").trim();
      if (!name) {
        return;
      }

      const code = columns.code ? String(row[columns.code] ?? "").trim() : "";
      const key = code || `${name.toLowerCase()}_${index}`;
      const uniqueKey = code || name;

      const value = parseValue(row[columns.value]);
      if (value === null) {
        return;
      }

      const target = columns.target ? parseValue(row[columns.target]) : null;
      const direction = normalizeDirection(columns.direction ? row[columns.direction] : "min");
      const derivedStatus = SemaphorePolicy.evaluateByRule(value, target, direction);
      const explicitStatus = columns.status ? SemaphorePolicy.normalizeStatus(row[columns.status]) : null;
      const finalStatus = explicitStatus ?? derivedStatus;

      const period = parsePeriod(columns.period ? row[columns.period] : "");
      const point = { period, value };

      if (!seriesByIndicator.has(uniqueKey)) {
        seriesByIndicator.set(uniqueKey, []);
      }

      seriesByIndicator.get(uniqueKey).push(point);

      const previous = latestByIndicator.get(uniqueKey);
      latestByIndicator.set(uniqueKey, {
        id: key,
        code: code || `IND-${String(index + 1).padStart(3, "0")}`,
        name,
        area: String(columns.area ? row[columns.area] ?? "Sin area" : "Sin area").trim() || "Sin area",
        objective: String(columns.objective ? row[columns.objective] ?? "Sin objetivo" : "Sin objetivo").trim() || "Sin objetivo",
        unit: String(columns.unit ? row[columns.unit] ?? "" : "").trim() || "unidad",
        currentValue: value,
        targetValue: target,
        status: finalStatus,
        process: String(columns.area ? row[columns.area] ?? "" : "").trim(),
        processId: String(columns.processId ? row[columns.processId] ?? "" : "").trim() || "N/D",
        frequency: String(columns.frequency ? row[columns.frequency] ?? "" : "").trim() || "Mensual",
        period,
        source: String(columns.source ? row[columns.source] ?? "" : "").trim() || "Sistema de informacion hospitalario HUS",
        direction,
        history: previous?.history ?? [],
      });
    });

    const indicators = Array.from(latestByIndicator.values()).map((item) => {
      const history = (seriesByIndicator.get(item.code) || seriesByIndicator.get(item.name) || [])
        .sort((a, b) => a.period.localeCompare(b.period));

      return new Indicator({
        ...item,
        history,
      });
    });

    return indicators;
  }

  _collectRows(workbook) {
    const rows = [];

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const parsed = this.xlsx.utils.sheet_to_json(sheet, {
        defval: "",
        raw: false,
      });
      rows.push(...parsed);
    });

    return rows;
  }
}
