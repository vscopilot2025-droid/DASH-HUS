export function formatNumber(value, unit = "") {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/D";
  }

  const formatted = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 2,
  }).format(value);

  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatStatus(status) {
  const labels = {
    ok: "Cumplido",
    warning: "Alerta",
    critical: "Critico",
  };

  return labels[status] ?? "Sin estado";
}
