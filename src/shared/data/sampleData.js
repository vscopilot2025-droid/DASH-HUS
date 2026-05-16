import { Indicator } from "../core/domain/entities/Indicator.js";

const MONTHS = [
  "2023-01", "2023-02", "2023-03", "2023-04", "2023-05", "2023-06",
  "2023-07", "2023-08", "2023-09", "2023-10", "2023-11", "2023-12",
  "2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06",
  "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12",
  "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06",
  "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12",
  "2026-01", "2026-02",
];

function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function buildHistory(seed, currentValue, unit, direction) {
  const random = makeRng(seed);
  const scale = unit === "%" ? 2.2 : unit === "Horas" || unit === "h" ? 1.6 : 6;

  return MONTHS.map((period, index) => {
    const trend = direction === "min" ? (MONTHS.length - index) * 0.03 : index * 0.03;
    const noise = (random() - 0.5) * scale;
    const value = Math.max(0, Number((currentValue + trend + noise).toFixed(2)));
    return { period, value };
  });
}

function createIndicator({
  id,
  code,
  name,
  area,
  objective,
  unit,
  currentValue,
  targetValue,
  status,
  process,
  processId,
  direction,
  source,
}) {
  return new Indicator({
    id: String(id),
    code,
    name,
    area,
    objective,
    unit,
    currentValue,
    targetValue,
    status,
    process,
    processId,
    frequency: "Mensual",
    period: "Feb 2026",
    source,
    direction,
    history: buildHistory(Number(id), currentValue, unit, direction),
  });
}

const areaA = "Gestion Servicio de Urgencias";
const areaB = "Gestion Servicio de Urgencias UFZ";

const processA = "Atencion al Pcte. de Urgencias";
const processB = "Referencia y Contrarreferencia";

const objectivePool = [
  "OBJ-1 Oportunidad",
  "OBJ-2 Seguridad",
  "OBJ-3 Efectividad",
  "OBJ-4 Accesibilidad",
];

const seedIndicators = [
  createIndicator({
    id: 4277,
    code: "ID-4277",
    name: "Tiempo Promedio Espera - Triage II",
    area: areaA,
    objective: "OBJ-1 Oportunidad",
    unit: "Minutos",
    currentValue: 14.19,
    targetValue: 8,
    status: "warning",
    process: processA,
    processId: "OOPU01-V3",
    direction: "min",
    source: "Tabla MEDICIONES - Proceso OOPU01-V3",
  }),
  createIndicator({
    id: 4307,
    code: "ID-4307",
    name: "Proporcion Reingresos a Urgencias <72h",
    area: areaA,
    objective: "OBJ-2 Seguridad",
    unit: "Porcentaje",
    currentValue: 0,
    targetValue: 4,
    status: "ok",
    process: processA,
    processId: "OOPU01-V3",
    direction: "min",
    source: "Tabla MEDICIONES - Proceso OOPU01-V3",
  }),
  createIndicator({
    id: 4319,
    code: "ID-4319",
    name: "Porcentaje de Remisiones Aceptadas en el HUS",
    area: areaA,
    objective: "OBJ-4 Accesibilidad",
    unit: "Porcentaje",
    currentValue: 94.5,
    targetValue: 90,
    status: "ok",
    process: processB,
    processId: "OORC01-V2",
    direction: "max",
    source: "Tabla MEDICIONES - Proceso OORC01-V2",
  }),
  createIndicator({
    id: 4331,
    code: "ID-4331",
    name: "Oportunidad Interconsulta - Cirugia General",
    area: areaA,
    objective: "OBJ-1 Oportunidad",
    unit: "Horas",
    currentValue: 1.25,
    targetValue: 4,
    status: "ok",
    process: processA,
    processId: "OOPU01-V3",
    direction: "min",
    source: "Tabla MEDICIONES - Proceso OOPU01-V3",
  }),
  createIndicator({
    id: 11075,
    code: "ID-11075",
    name: "Oportunidad Interconsulta - Radiologia",
    area: areaA,
    objective: "OBJ-1 Oportunidad",
    unit: "Horas",
    currentValue: 3.47,
    targetValue: 4,
    status: "ok",
    process: processA,
    processId: "OOPU01-V3",
    direction: "min",
    source: "Tabla MEDICIONES - Proceso OOPU01-V3",
  }),
  createIndicator({
    id: 4309,
    code: "ID-4309",
    name: "Porcentaje de Mortalidad en Urgencias antes de las 24 horas",
    area: areaA,
    objective: "OBJ-3 Efectividad",
    unit: "Porcentaje",
    currentValue: 0.72,
    targetValue: 1,
    status: "ok",
    process: processA,
    processId: "OOPU01-V3",
    direction: "min",
    source: "Tabla MEDICIONES - Proceso OOPU01-V3",
  }),
];

const areaAIndicators = [...seedIndicators];
const areaBIndicators = [];

let nextId = 12000;

while (areaAIndicators.length < 185) {
  const idx = areaAIndicators.length + 1;
  const objective = objectivePool[idx % objectivePool.length];
  const unit = idx % 3 === 0 ? "Horas" : idx % 3 === 1 ? "Minutos" : "Porcentaje";
  const direction = unit === "Porcentaje" && idx % 4 === 0 ? "max" : "min";
  const status = areaAIndicators.filter((i) => i.status === "warning").length < 5 ? "warning" : "ok";
  const targetValue = unit === "Horas" ? 8 : unit === "Minutos" ? 20 : direction === "max" ? 92 : 5;
  const currentValue = status === "warning"
    ? (unit === "Horas" ? 9.2 : unit === "Minutos" ? 23.4 : direction === "max" ? 88 : 7.4)
    : (unit === "Horas" ? 3.2 : unit === "Minutos" ? 11.8 : direction === "max" ? 95.4 : 2.1);

  areaAIndicators.push(
    createIndicator({
      id: nextId,
      code: `ID-${nextId}`,
      name: `Indicador Urgencias ${idx}`,
      area: areaA,
      objective,
      unit,
      currentValue: Number(currentValue.toFixed(2)),
      targetValue,
      status,
      process: idx % 5 === 0 ? processB : processA,
      processId: idx % 5 === 0 ? "OORC01-V2" : "OOPU01-V3",
      direction,
      source: "Tabla MEDICIONES - Sistema HUS",
    }),
  );

  nextId += 1;
}

while (areaBIndicators.length < 22) {
  const idx = areaBIndicators.length + 1;
  const objective = objectivePool[(idx + 1) % objectivePool.length];
  const unit = idx % 2 === 0 ? "Porcentaje" : "Minutos";
  const direction = unit === "Porcentaje" ? "max" : "min";
  const status = idx === 1 ? "critical" : "ok";
  const targetValue = unit === "Porcentaje" ? 90 : 25;
  const currentValue = status === "critical" ? 33.2 : unit === "Porcentaje" ? 96.2 : 18.7;

  areaBIndicators.push(
    createIndicator({
      id: nextId,
      code: `ID-${nextId}`,
      name: `Indicador UFZ ${idx}`,
      area: areaB,
      objective,
      unit,
      currentValue: Number(currentValue.toFixed(2)),
      targetValue,
      status,
      process: processB,
      processId: "OORC01-V2",
      direction,
      source: "Tabla MEDICIONES - Sistema HUS",
    }),
  );

  nextId += 1;
}

export const sampleIndicators = [...areaAIndicators, ...areaBIndicators];
