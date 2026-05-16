const STATUS = {
  OK: "ok",
  WARNING: "warning",
  CRITICAL: "critical",
};

function sanitizeNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const onlySymbols = trimmed.replace(/[^0-9,.-]/g, "");
  const hasComma = onlySymbols.includes(",");
  const hasDot = onlySymbols.includes(".");

  let canonical = onlySymbols;

  if (hasComma && hasDot) {
    const lastComma = onlySymbols.lastIndexOf(",");
    const lastDot = onlySymbols.lastIndexOf(".");
    const decimalSeparator = lastComma > lastDot ? "," : ".";

    if (decimalSeparator === ",") {
      canonical = onlySymbols.replace(/\./g, "").replace(/,/g, ".");
    } else {
      canonical = onlySymbols.replace(/,/g, "");
    }
  } else if (hasComma) {
    canonical = onlySymbols.replace(/,/g, ".");
  }

  const parsed = Number(canonical);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeStatus(raw) {
  if (!raw) {
    return null;
  }

  const value = String(raw).trim().toLowerCase();
  if (["ok", "cumplido", "verde", "green"].includes(value)) {
    return STATUS.OK;
  }

  if (["alerta", "warning", "amarillo", "yellow"].includes(value)) {
    return STATUS.WARNING;
  }

  if (["critico", "crítico", "rojo", "critical", "red"].includes(value)) {
    return STATUS.CRITICAL;
  }

  return null;
}

function evaluateByRule(currentValue, targetValue, direction = "min") {
  const value = sanitizeNumber(currentValue);
  const target = sanitizeNumber(targetValue);

  if (value === null || target === null || target === 0) {
    return STATUS.WARNING;
  }

  if (direction === "max") {
    if (value >= target) {
      return STATUS.OK;
    }

    if (value >= target * 0.9) {
      return STATUS.WARNING;
    }

    return STATUS.CRITICAL;
  }

  if (value <= target) {
    return STATUS.OK;
  }

  if (value <= target * 1.1) {
    return STATUS.WARNING;
  }

  return STATUS.CRITICAL;
}

export const SemaphorePolicy = {
  STATUS,
  sanitizeNumber,
  normalizeStatus,
  evaluateByRule,
};
