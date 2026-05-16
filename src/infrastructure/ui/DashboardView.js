import { formatNumber, formatStatus } from "./formatters.js";

const OBJECTIVE_MODULES = [
  {
    title: "OBJ-1 Oportunidad en la Atencion",
    subtitle: "Atencion centrada en el usuario - Prestacion de Servicios - Oportuno",
    footer: "11 indicadores vinculados",
  },
  {
    title: "OBJ-2 Gestion Clinica Segura",
    subtitle: "Prestacion de Servicios - Seguro - Efectividad",
    footer: "Proceso OOPU01-V3",
  },
  {
    title: "OBJ-3 Manejo Integral del Paciente",
    subtitle: "Prestacion de Servicios - Efectividad",
    footer: "1 indicador vinculado",
  },
  {
    title: "OBJ-4 Accesibilidad y Red de Cundinamarca",
    subtitle: "Articulado con la red - Prestacion de Servicios",
    footer: "Ref. y Contrarreferencia",
  },
];

function getAreaCompliance(areaName) {
  if (areaName === "Gestion Servicio de Urgencias") {
    return 89;
  }

  if (areaName === "Gestion Servicio de Urgencias UFZ") {
    return 95;
  }

  return 90;
}

export class DashboardView {
  constructor({
    elements,
    onAreaSelect,
    onStatusFilterSelect,
    onIndicatorSelect,
    onBackToAreas,
    onBackToIndicators,
  }) {
    this.elements = elements;
    this.onAreaSelect = onAreaSelect;
    this.onStatusFilterSelect = onStatusFilterSelect;
    this.onIndicatorSelect = onIndicatorSelect;
    this.onBackToAreas = onBackToAreas;
    this.onBackToIndicators = onBackToIndicators;
  }

  bindInteractions() {
    this.elements.filters.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-filter-type='status']");
      if (!button) {
        return;
      }

      const value = button.dataset.filterValue;
      this._setActiveFilterButton(value);
      this.onStatusFilterSelect(value);
    });

    this.elements.backToAreasBtn.addEventListener("click", () => {
      this.onBackToAreas();
    });

    this.elements.backToIndicatorsBtn.addEventListener("click", () => {
      this.onBackToIndicators();
    });
  }

  setScreen(screen) {
    const mapping = {
      areas: this.elements.screenAreas,
      indicators: this.elements.screenIndicators,
      detail: this.elements.screenDetail,
    };

    Object.values(mapping).forEach((el) => el.classList.remove("active"));
    mapping[screen].classList.add("active");

    const stepMap = { areas: "1", indicators: "2", detail: "3" };
    const step = stepMap[screen];
    this.elements.stepLinks.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.step === step);
    });
  }

  renderAreasScreen(snapshot) {
    this._renderKpis(snapshot.kpis);
    this._renderAreas(snapshot.areas);
    this._renderObjectives();
  }

  renderIndicatorsScreen({ areaSummary, indicators }) {
    const areaName = areaSummary?.area ?? "Area sin seleccion";
    this.elements.selectedAreaTitle.textContent = areaName;
    this.elements.selectedAreaSubtitle.textContent = "Haz clic en cualquier fila para abrir la ficha tecnica del indicador.";

    this.elements.areaStats.innerHTML = "";
    if (areaSummary) {
      const stats = [
        { label: "Porcentaje", value: getAreaCompliance(areaName) },
        { label: "Minutos", value: 51 },
        { label: "Horas", value: 30 },
        { label: "Tasa x mil", value: 9 },
      ];

      stats.forEach((stat) => {
        const node = document.createElement("div");
        node.className = "mini-stat";
        node.innerHTML = `<span class="v">${stat.value}</span><span class="l">${stat.label}</span>`;
        this.elements.areaStats.appendChild(node);
      });
    }

    this._renderTable(indicators);
  }

  renderIndicatorDetail(indicator, chartAdapter) {
    if (!indicator) {
      this.elements.detailEmpty.classList.remove("hidden");
      this.elements.detailContent.classList.add("hidden");
      this.elements.detailCode.textContent = "Sin seleccion";
      return;
    }

    this.elements.detailEmpty.classList.add("hidden");
    this.elements.detailContent.classList.remove("hidden");

    this.elements.detailCode.textContent = indicator.code;
    this.elements.detailName.textContent = indicator.name;
    this.elements.detailArea.textContent = indicator.area;
    this.elements.detailObjective.textContent = indicator.objective;
    this.elements.detailStatus.textContent = formatStatus(indicator.status);
    this.elements.detailValue.textContent = formatNumber(indicator.currentValue, indicator.unit);
    this.elements.detailTarget.textContent = formatNumber(indicator.targetValue, indicator.unit);
    this.elements.detailProcessId.textContent = indicator.processId;
    this.elements.detailFrequency.textContent = indicator.frequency;
    this.elements.detailSource.textContent = indicator.source;
    this.elements.detailDirection.textContent = indicator.direction === "max" ? "Mayor es mejor" : "Menor es mejor";

    this._renderRecentHistory(indicator);
    chartAdapter.render(indicator);
  }

  setUploadMessage(message, isError = false) {
    this.elements.uploadMessage.textContent = message;
    this.elements.uploadMessage.style.color = isError ? "#ff8f8f" : "#9cc5de";
  }

  setDatasetTag(label) {
    this.elements.datasetTag.textContent = label;
  }

  _renderKpis(kpis) {
    this.elements.kpiStrip.innerHTML = "";

    kpis.forEach((kpi) => {
      const card = document.createElement("article");
      card.className = "kpi-card";
      card.innerHTML = `
        <p class="kpi-title">${kpi.title}</p>
        <p class="kpi-value">${kpi.value}</p>
      `;
      this.elements.kpiStrip.appendChild(card);
    });
  }

  _renderAreas(areas) {
    this.elements.areasGrid.innerHTML = "";
    this.elements.areasCount.textContent = `${areas.length} areas`;

    areas.forEach((areaSummary) => {
      const activeCount = areaSummary.ok;
      const alertCount = areaSummary.warning + areaSummary.critical;
      const compliance = getAreaCompliance(areaSummary.area);

      const card = document.createElement("button");
      card.type = "button";
      card.className = "area-card";
      card.innerHTML = `
        <div class="area-head">
          <p class="area-name">${areaSummary.area}</p>
          <span class="chip">${alertCount > 0 ? `${alertCount} alertas` : "En orden"}</span>
        </div>
        <p class="area-meta">
          <span>${areaSummary.total} indicadores</span>
          <span>${alertCount} en alerta</span>
          <span>${activeCount} activos</span>
        </p>
        <div class="area-progress">
          <div class="area-progress-fill" style="width:${compliance}%"></div>
        </div>
        <div class="area-footer">
          <span class="chip">Cumplimiento global ${compliance}%</span>
          <span class="go-link">Ver indicadores</span>
        </div>
      `;
      card.addEventListener("click", () => this.onAreaSelect(areaSummary.area));
      this.elements.areasGrid.appendChild(card);
    });
  }

  _renderObjectives() {
    this.elements.objectiveGrid.innerHTML = "";

    OBJECTIVE_MODULES.forEach((objective, index) => {
      const node = document.createElement("article");
      node.className = "obj-card";
      node.style.borderTop = `3px solid ${["#4fa4ff", "#56d38b", "#8d7dff", "#f2b64a"][index]}`;
      node.innerHTML = `
        <p class="obj-title">${objective.title}</p>
        <p class="obj-sub">${objective.subtitle}</p>
        <p class="obj-foot">${objective.footer}</p>
      `;
      this.elements.objectiveGrid.appendChild(node);
    });
  }

  _renderTable(indicators) {
    this.elements.indicatorTableBody.innerHTML = "";

    indicators.forEach((indicator) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${indicator.id}</td>
        <td>
          <strong>${indicator.name}</strong><br>
          <small>${indicator.objective} - ${indicator.processId}</small>
        </td>
        <td>${formatNumber(indicator.currentValue)}</td>
        <td><span class="status-tag ${indicator.status}">${formatStatus(indicator.status)}</span></td>
        <td>${indicator.unit}</td>
        <td>${indicator.frequency}</td>
        <td>${indicator.period}</td>
        <td><span class="row-action">Abrir</span></td>
      `;
      row.addEventListener("click", () => this.onIndicatorSelect(indicator.id));
      this.elements.indicatorTableBody.appendChild(row);
    });
  }

  _renderRecentHistory(indicator) {
    this.elements.recentHistoryBody.innerHTML = "";

    const recent = [...indicator.history].slice(-8).reverse();
    recent.forEach((row) => {
      const tr = document.createElement("tr");
      const status = this._statusFromValue(indicator, row.value);
      tr.innerHTML = `
        <td>${row.period}</td>
        <td>${formatNumber(row.value, indicator.unit)}</td>
        <td><span class="status-tag ${status}">${formatStatus(status)}</span></td>
      `;
      this.elements.recentHistoryBody.appendChild(tr);
    });
  }

  _statusFromValue(indicator, value) {
    if (indicator.direction === "max") {
      if (value >= indicator.targetValue) {
        return "ok";
      }
      if (value >= indicator.targetValue * 0.9) {
        return "warning";
      }
      return "critical";
    }

    if (value <= indicator.targetValue) {
      return "ok";
    }
    if (value <= indicator.targetValue * 1.1) {
      return "warning";
    }
    return "critical";
  }

  _setActiveFilterButton(value) {
    const buttons = this.elements.filters.querySelectorAll("button[data-filter-type='status']");
    buttons.forEach((button) => {
      button.classList.toggle("active", button.dataset.filterValue === value);
    });
  }
}
