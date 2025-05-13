class chartHandler {
  constructor() {
    this.lineChart;
    this.barSpo2Chart;
    this.barHrChart;
  }

  drawLineChart(lineCtx, data, formerLineChart) {
    const labels = [];
    const spo2Dataset = [];
    const hrDataset = [];

    if (data.success) {
      data.results.forEach((el) => {
        labels.push(el.date);
        spo2Dataset.push(el.spo2);
        hrDataset.push(el.hr);
      });
    }

    if (typeof formerLineChart !== "undefined") {
      formerLineChart.destroy();
    }
    this.lineChart = new Chart(lineCtx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "SpO2",
            data: spo2Dataset,
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 2,
            fill: false,
          },
          {
            label: "HR",
            data: hrDataset,
            borderColor: "rgb(235, 54, 54)",
            borderWidth: 2,
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
    return this.lineChart;
  }

  drawSpo2BarChart(barSpo2Ctx, data, formerBarSpo2Chart) {
    const labels = [];
    const count = [];

    if (data.success) {
      data.results.forEach((el) => {
        labels.push(el.spo2);
        count.push(el["count(spo2)"]);
      });
    }

    if (typeof formerBarSpo2Chart !== "undefined") {
      formerBarSpo2Chart.destroy();
    }
    // Create a new Chart object
    this.barSpo2Chart = new Chart(barSpo2Ctx, {
      type: "bar", // The type of chart we want to create
      data: {
        labels: labels, // Labels for the chart
        datasets: [
          {
            label: "SpO2",
            data: count, // Data points for the chart
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true, // Start the y-axis at 0
          },
        },
      },
    });
    return this.barSpo2Chart;
  }

  drawHrBarChart(barHrCtx, data, formerBarHrChart) {
    const labels = [];
    const count = [];

    if (data.success) {
      data.results.forEach((el) => {
        labels.push(el.hr);
        count.push(el["count(hr)"]);
      });
    }

    if (typeof formerBarHrChart !== "undefined") {
      formerBarHrChart.destroy();
    }
    // Create a new Chart object
    this.barHrChart = new Chart(barHrCtx, {
      type: "bar", // The type of chart we want to create
      data: {
        labels: labels, // Labels for the chart
        datasets: [
          {
            label: "HR",
            data: count, // Data points for the chart
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true, // Start the y-axis at 0
          },
        },
      },
    });
    return this.barHrChart;
  }
}

export { chartHandler };
