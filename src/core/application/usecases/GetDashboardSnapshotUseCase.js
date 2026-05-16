import { KpiService } from "../../domain/services/KpiService.js";

export class GetDashboardSnapshotUseCase {
  constructor(indicatorRepository) {
    this.indicatorRepository = indicatorRepository;
  }

  execute({ area = "all", status = "all" } = {}) {
    const allIndicators = this.indicatorRepository.getAll();

    const filtered = allIndicators.filter((item) => {
      const areaMatch = area === "all" || item.area === area;
      const statusMatch = status === "all" || item.status === status;
      return areaMatch && statusMatch;
    });

    return {
      kpis: KpiService.buildKpis(allIndicators),
      areas: KpiService.summarizeAreas(allIndicators),
      allIndicators,
      indicators: filtered,
    };
  }
}
