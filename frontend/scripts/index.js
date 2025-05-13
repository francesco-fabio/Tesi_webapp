import { chartHandler } from "./chartsHandler.js";

const select = document.getElementById("recordings");
const lineCtx = document.getElementById("lineChart").getContext("2d");
const barSpo2Ctx = document.getElementById("spo2Chart").getContext("2d");
const barHrCtx = document.getElementById("hrChart").getContext("2d");
const avgSpo2 = document.getElementById("spo2_avg");
const avgHr = document.getElementById("hr_avg");
let formerLineChart;
let formerBarSpo2Chart;
let formerBarHrChart;

try {
  fetch("http://localhost:3001/charts/filename")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        data.results.forEach((el) => {
          const op = document.createElement("option");
          op.value = el.file_name;
          op.textContent = el.file_name;
          select.appendChild(op);
        });
      }
    });
} catch (err) {
  console.log(`errore nel recupero dei nomi: ${err}`);
}

select.addEventListener("change", (event) => {
  console.log(`change event detected, value: ${event.target.value}`);

  fetch(`http://localhost:3001/charts/avg/${event.target.value}`)
    .then((response) => response.json())
    .then((data) => {
      let spo2;
      let hr;
      // recupera i valori
      if (data.success) {
        data.results.forEach((el) => {
          spo2 = el.spo2_avg;
          hr = el.hr_avg;
        });

        // varia il colore in base al valore
        if (spo2 < 90) {
          avgSpo2.style.color = "red";
        } else if (spo2 <= 94) {
          avgSpo2.style.color = "orange";
        } else {
          avgSpo2.style.color = "green";
        }

        // varia il colore in base al valore
        if (hr < 45 || hr >= 130) {
          avgHr.style.color = "red";
        } else if (hr <= 60 || hr > 100) {
          avgHr.style.color = "orange";
        } else {
          avgHr.style.color = "green";
        }

        // assegna i valori nei relativi span
        avgSpo2.textContent = spo2;
        avgHr.textContent = hr;
      }
    });

  fetch(`http://localhost:3001/charts/file/${event.target.value}`)
    .then((response) => response.json())
    .then((data) => {
      const ch = new chartHandler();
      const chart = ch.drawLineChart(lineCtx, data, formerLineChart);
      formerLineChart = chart;
    });

  fetch(`http://localhost:3001/charts/spo2-count/${event.target.value}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const ch = new chartHandler();
      const chart = ch.drawSpo2BarChart(barSpo2Ctx, data, formerBarSpo2Chart);
      formerBarSpo2Chart = chart;
    });

  fetch(`http://localhost:3001/charts/hr-count/${event.target.value}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const ch = new chartHandler();
      const chart = ch.drawHrBarChart(barHrCtx, data, formerBarHrChart);
      formerBarHrChart = chart;
    });
});
