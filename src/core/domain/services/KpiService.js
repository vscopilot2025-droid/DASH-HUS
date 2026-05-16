export class KpiService {
  static buildKpis(indicators) {
    const totalIndicators = indicators.length;
    const areas = new Set(indicators.map((item) => item.area));
    const processes = new Set(indicators.map((item) => item.processId || item.process));
    const objectives = new Set(indicators.map((item) => item.objective));

    return [
      { id: "areas", title: "Areas registradas", value: areas.size },
      { id: "processes", title: "Procesos vinculados", value: processes.size },
      { id: "indicators", title: "Indicadores en BD", value: totalIndicators },
      { id: "objectives", title: "Objetivos estrategicos", value: objectives.size },
    ];
  }

  static summarizeAreas(indicators) {
    const map = new Map();

    for (const indicator of indicators) {
      if (!map.has(indicator.area)) {
        map.set(indicator.area, {
          area: indicator.area,
          total: 0,
          critical: 0,
          warning: 0,
          ok: 0,
        });
      }

      const areaEntry = map.get(indicator.area);
      areaEntry.total += 1;
      areaEntry[indicator.status] += 1;
    }

    return Array.from(map.values()).sort((a, b) => a.area.localeCompare(b.area));
  }
}
