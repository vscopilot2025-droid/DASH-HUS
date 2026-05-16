export class Indicator {
  constructor({
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
    frequency,
    period,
    source,
    direction,
    history,
  }) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.area = area;
    this.objective = objective;
    this.unit = unit;
    this.currentValue = currentValue;
    this.targetValue = targetValue;
    this.status = status;
    this.process = process;
    this.processId = processId ?? "N/D";
    this.frequency = frequency ?? "Mensual";
    this.period = period ?? "Feb 2026";
    this.source = source ?? "Sistema de informacion hospitalario HUS";
    this.direction = direction;
    this.history = history ?? [];
  }
}
