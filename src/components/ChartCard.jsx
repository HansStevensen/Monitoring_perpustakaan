import { createSignal, Show } from "solid-js";
import { LIMITS } from "../data"; //ambil Limit dari dat

//card untuk nampilin masing-masing data sensor
export default function ChartCard(props) {
  //signal untuk ngubah mode tampilan (ada tampilan chart sama tampilan angka)
  const [viewMode, setViewMode] = createSignal("chart");

  // Helper untuk mengambil nilai terakhir atau 0 jika kosong
  const lastValue = () => props.data[props.data.length - 1] ?? 0;

  // Logika Pengecekan Error untuk 4 Jenis Sensor
  const hasError = () => {
    const val = lastValue();
    switch (props.title) {
      case "Suhu": return val > LIMITS.suhuMax;
      case "Kebisingan": return val > LIMITS.kebisinganMax;
      case "Kelembapan": return val > LIMITS.kelembapanMax;
      case "Cahaya": return val < LIMITS.cahayaMin; // Error jika terlalu gelap
      default: return false;
    }
  };

  // Helper untuk menampilkan satuan yang sesuai
  const getUnit = () => {
    switch (props.title) {
      case "Suhu": return "°C";
      case "Kebisingan": return " dB";
      case "Kelembapan": return "%";
      case "Cahaya": return " Lux";
      default: return "";
    }
  };

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
          <div class="chart-content">
             <h2 class="chart-value">
                {lastValue()}<span class="unit-text-small">{getUnit()}</span>
             </h2>
             <p class="chart-status-label">Visualisasi Tren Aktif</p>
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
          onClick={() => setViewMode("text")}
        >
          Angka
        </button>
      </div>
    </div>
  );
}