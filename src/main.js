import { GetDashboardSnapshotUseCase } from "./core/application/usecases/GetDashboardSnapshotUseCase.js";
import { ImportExcelUseCase } from "./core/application/usecases/ImportExcelUseCase.js";
import { GetIndicatorDetailUseCase } from "./core/application/usecases/GetIndicatorDetailUseCase.js";
import { InMemoryIndicatorRepository } from "./infrastructure/repositories/InMemoryIndicatorRepository.js";
import { ExcelWorkbookParser } from "./infrastructure/parsers/ExcelWorkbookParser.js";
import { DashboardView } from "./infrastructure/ui/DashboardView.js";
import { ChartJsLineChart } from "./infrastructure/ui/ChartJsLineChart.js";
import { generateSampleIndicators } from "./shared/data/sampleDataReal.js";
import { initAuthentication } from "./presentation/middleware/auth.js";

// Cargar indicadores reales del reporte HUS
const sampleIndicators = generateSampleIndicators();
let isBootstrapped = false;

function byName(a, b) {
  return a.name.localeCompare(b.name);
}

function bootstrap() {
  const husLogo = document.getElementById("husLogo");
  const logoFallback = document.getElementById("logoFallback");

  husLogo?.addEventListener("error", () => {
    husLogo.classList.add("hidden");
    logoFallback?.classList.remove("hidden");
  });

  const elements = {
    excelInput: document.getElementById("excelInput"),
    resetDataBtn: document.getElementById("resetDataBtn"),
    uploadMessage: document.getElementById("uploadMessage"),
    datasetTag: document.getElementById("datasetTag"),
    stepLinks: document.querySelectorAll(".step-link"),
    screenAreas: document.getElementById("screenAreas"),
    screenIndicators: document.getElementById("screenIndicators"),
    screenDetail: document.getElementById("screenDetail"),
    backToAreasBtn: document.getElementById("backToAreasBtn"),
    backToIndicatorsBtn: document.getElementById("backToIndicatorsBtn"),
    kpiStrip: document.getElementById("kpiStrip"),
    areasGrid: document.getElementById("areasGrid"),
    areasCount: document.getElementById("areasCount"),
    objectiveGrid: document.getElementById("objectiveGrid"),
    selectedAreaTitle: document.getElementById("selectedAreaTitle"),
    selectedAreaSubtitle: document.getElementById("selectedAreaSubtitle"),
    areaStats: document.getElementById("areaStats"),
    filters: document.getElementById("filters"),
    indicatorTableBody: document.getElementById("indicatorTableBody"),
    detailEmpty: document.getElementById("detailEmpty"),
    detailContent: document.getElementById("detailContent"),
    detailCode: document.getElementById("detailCode"),
    detailValue: document.getElementById("detailValue"),
    detailTarget: document.getElementById("detailTarget"),
    detailName: document.getElementById("detailName"),
    detailArea: document.getElementById("detailArea"),
    detailObjective: document.getElementById("detailObjective"),
    detailStatus: document.getElementById("detailStatus"),
    detailProcessId: document.getElementById("detailProcessId"),
    detailFrequency: document.getElementById("detailFrequency"),
    detailSource: document.getElementById("detailSource"),
    detailDirection: document.getElementById("detailDirection"),
    recentHistoryBody: document.getElementById("recentHistoryBody"),
    chartCanvas: document.getElementById("indicatorChart"),
  };

  const indicatorRepository = new InMemoryIndicatorRepository(sampleIndicators.sort(byName));
  const excelParser = new ExcelWorkbookParser(globalThis.XLSX);

  const getDashboardSnapshot = new GetDashboardSnapshotUseCase(indicatorRepository);
  const importExcel = new ImportExcelUseCase(indicatorRepository, excelParser);
  const getIndicatorDetail = new GetIndicatorDetailUseCase(indicatorRepository);

  const chartAdapter = new ChartJsLineChart(elements.chartCanvas, globalThis.Chart);

  const state = {
    currentScreen: "areas",
    selectedArea: "all",
    selectedStatus: "all",
    selectedIndicatorId: null,
  };

  const view = new DashboardView({
    elements,
    onAreaSelect: (area) => {
      state.selectedArea = area;
      state.selectedStatus = "all";
      state.selectedIndicatorId = null;
      state.currentScreen = "indicators";
      render();
    },
    onStatusFilterSelect: (status) => {
      state.selectedStatus = status;
      renderIndicators();
    },
    onIndicatorSelect: (indicatorId) => {
      state.selectedIndicatorId = indicatorId;
      state.currentScreen = "detail";
      render();
    },
    onBackToAreas: () => {
      state.currentScreen = "areas";
      state.selectedStatus = "all";
      render();
    },
    onBackToIndicators: () => {
      state.currentScreen = "indicators";
      render();
    },
  });

  view.bindInteractions();

  elements.excelInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      view.setUploadMessage("Procesando archivo Excel...");
      const count = await importExcel.execute(file);
      view.setDatasetTag(`EXCEL: ${file.name}`);
      view.setUploadMessage(`Carga completada: ${count} indicadores procesados.`);

      const firstArea = getDashboardSnapshot.execute().areas[0]?.area ?? "all";
      state.currentScreen = "areas";
      state.selectedArea = firstArea;
      state.selectedStatus = "all";
      state.selectedIndicatorId = null;

      render();
    } catch (error) {
      view.setUploadMessage(`Error al importar: ${error.message}`, true);
    } finally {
      elements.excelInput.value = "";
    }
  });

  elements.resetDataBtn.addEventListener("click", () => {
    indicatorRepository.replaceAll(sampleIndicators.sort(byName));
    const firstArea = getDashboardSnapshot.execute().areas[0]?.area ?? "all";
    state.currentScreen = "areas";
    state.selectedArea = firstArea;
    state.selectedStatus = "all";
    state.selectedIndicatorId = null;

    view.setDatasetTag("DATASET BASE");
    view.setUploadMessage("Se restauraron los datos iniciales.");

    render();
  });

  function renderAreas() {
    const snapshot = getDashboardSnapshot.execute();
    view.renderAreasScreen(snapshot);
  }

  function renderIndicators() {
    const snapshot = getDashboardSnapshot.execute({
      area: state.selectedArea,
      status: state.selectedStatus,
    });
    const sortedIndicators = [...snapshot.indicators].sort(byName);
    const areaSummary = snapshot.areas.find((area) => area.area === state.selectedArea) ?? null;

    view.renderIndicatorsScreen({
      areaSummary,
      indicators: sortedIndicators,
    });
  }

  function renderDetail() {
    const detail = state.selectedIndicatorId
      ? getIndicatorDetail.execute(state.selectedIndicatorId)
      : null;

    view.renderIndicatorDetail(detail, chartAdapter);
  }

  function render() {
    view.setScreen(state.currentScreen);

    if (state.currentScreen === "areas") {
      renderAreas();
      return;
    }

    if (state.currentScreen === "indicators") {
      renderIndicators();
      return;
    }

    renderDetail();
  }

  const firstArea = getDashboardSnapshot.execute().areas[0]?.area ?? "all";
  state.selectedArea = firstArea;
  render();
}

window.addEventListener("DOMContentLoaded", () => {
  initAuthentication(() => {
    if (isBootstrapped) {
      return;
    }

    isBootstrapped = true;
    bootstrap();
  });
});
