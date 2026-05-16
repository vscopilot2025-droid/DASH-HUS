export class ChartJsLineChart {
  constructor(canvas, chartLibrary) {
    this.canvas = canvas;
    this.Chart = chartLibrary;
    this.instance = null;
  }

  render(indicator) {
    if (!this.Chart || !this.canvas) {
      return;
    }

    const labels = indicator.history.map((point) => point.period);
    const values = indicator.history.map((point) => point.value);

    if (this.instance) {
      this.instance.destroy();
    }

    const context = this.canvas.getContext("2d");
    const gradient = context.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, "rgba(63, 168, 255, 0.35)");
    gradient.addColorStop(0.6, "rgba(72, 227, 145, 0.16)");
    gradient.addColorStop(1, "rgba(72, 227, 145, 0)");

    this.instance = new this.Chart(context, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: indicator.name,
            data: values,
            borderColor: "#46b3ff",
            backgroundColor: gradient,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.28,
            pointBackgroundColor: "#48e391",
            pointBorderColor: "#1b2f4a",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            ticks: { color: "rgba(220, 240, 255, 0.65)", maxRotation: 0, minRotation: 0 },
            grid: { color: "rgba(120, 180, 220, 0.12)" },
          },
          y: {
            beginAtZero: true,
            ticks: { color: "rgba(220, 240, 255, 0.65)" },
            grid: { color: "rgba(120, 180, 220, 0.12)" },
          },
        },
      },
    });
  }
}
