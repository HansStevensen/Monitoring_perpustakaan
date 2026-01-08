/* src/components/ChartCard.jsx */
import { createSignal, Show, createEffect, onCleanup } from "solid-js";
import Chart from "chart.js/auto"; 
import { LIMITS } from "../data";

export default function ChartCard(props) {
  const [viewMode, setViewMode] = createSignal("chart");
  let canvasRef;
  let chartInstance = null;

  // --- HELPER BARU (Karena struktur data berubah jadi Objek) ---
  
  // Ambil item terakhir: { value: ..., time: ... }
  const lastItem = () => props.data[props.data.length - 1];
  
  // Ambil nilainya saja (aman jika data masih kosong)
  const lastValue = () => lastItem()?.value ?? 0;

  const hasError = () => {
    const val = lastValue();
    switch (props.title) {
      case "Suhu": return val > LIMITS.suhuMax;
      case "Kebisingan": return val > LIMITS.kebisinganMax;
      case "Kelembapan": return val > LIMITS.kelembapanMax;
      case "Cahaya": return val < LIMITS.cahayaMin; 
      default: return false;
    }
  };

  const getUnit = () => {
    switch (props.title) {
      case "Suhu": return "°C";
      case "Kebisingan": return " dB";
      case "Kelembapan": return "%";
      case "Cahaya": return " Lux";
      default: return "";
    }
  };

  // --- LOGIKA CHART.JS ---
  const initChart = () => {
    if (!canvasRef) return;
    if (chartInstance) chartInstance.destroy();

    const ctx = canvasRef.getContext("2d");

    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        // SUMBU X: Ambil property .time dari setiap data
        labels: props.data.map(d => d.time), 
        datasets: [
          {
            label: props.title,
            // SUMBU Y: Ambil property .value dari setiap data
            data: props.data.map(d => d.value), 
            borderColor: hasError() ? "#ef4444" : "#2563eb", 
            backgroundColor: hasError() ? "rgba(239, 68, 68, 0.2)" : "rgba(37, 99, 235, 0.2)",
            borderWidth: 2,
            pointRadius: 3,
            fill: true,
            tension: 0.4 
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        },
        scales: {
          x: {
            display: true, // Tampilkan Label Waktu
            ticks: {
              maxTicksLimit: 5, // Biar label tidak menumpuk
              font: { size: 10 }
            },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            grid: { color: "#f1f5f9" }
          }
        },
        animation: { duration: 0 }
      }
    });
  };

  createEffect(() => {
    if (viewMode() === "chart" && canvasRef) {
      if (!chartInstance) {
        initChart();
      } else {
        // Update Real-time: Pisahkan Waktu dan Nilai
        chartInstance.data.labels = props.data.map(d => d.time);
        chartInstance.data.datasets[0].data = props.data.map(d => d.value);
        
        // Update Warna Dinamis
        chartInstance.data.datasets[0].borderColor = hasError() ? "#ef4444" : "#2563eb";
        chartInstance.data.datasets[0].backgroundColor = hasError() ? "rgba(239, 68, 68, 0.2)" : "rgba(37, 99, 235, 0.2)";
        
        chartInstance.update();
      }
    }
  });

  onCleanup(() => {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  });

  return (
    <div class="sensor-block">
      <div class="chart-card" classList={{ "is-error": hasError() }}>
        <h3 class="chart-title">{props.title}</h3>

        <Show 
          when={viewMode() === "chart"} 
          fallback={
            <div class="text-mode-container">
              <h2 class="text-mode-value">
                {lastValue()}<span class="unit-text">{getUnit()}</span>
              </h2>
            </div>
          }
        >
          <div class="chart-content" style="position: relative; height: 160px; width: 100%;">
             <canvas ref={canvasRef} />
          </div>
        </Show>

        <Show when={hasError()}>
          <div class="error-badge">
            {props.title === "Cahaya" ? "Cahaya Redup!" : "Batas Terlampaui!"}
          </div>
        </Show>
      </div>

      <div class="button-group">
        <button 
          class="view-btn" 
          classList={{ active: viewMode() === "chart" }}
          onClick={() => setViewMode("chart")}
        >
          Grafik
        </button>
        <button 
          class="view-btn" 
          classList={{ active: viewMode() === "text" }}
          onClick={() => {
            setViewMode("text");
            if(chartInstance) {
               chartInstance.destroy();
               chartInstance = null;
            }
          }}
        >
          Angka
        </button>
      </div>
    </div>
  );
}