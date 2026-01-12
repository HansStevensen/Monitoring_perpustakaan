/* src/components/ChartCard.jsx */
import { createSignal, Show, createEffect, onCleanup } from "solid-js";
import Chart from "chart.js/auto"; 
import { LIMITS } from "../data";

export default function ChartCard(props) {
  const [viewMode, setViewMode] = createSignal("chart");
  const [now, setNow] = createSignal(Date.now()); // State untuk waktu saat ini
  
  let canvasRef;
  let chartInstance = null;

  // --- 1. TIMER DETAK JANTUNG (Update setiap 1 detik) ---
  const timer = setInterval(() => {
    setNow(Date.now());
  }, 1000);

  // --- 2. HELPER DATA ---
  
  // Ambil item terakhir dari array data
  const lastItem = () => {
    if (!props.data || props.data.length === 0) return null;
    return props.data[props.data.length - 1];
  };
  
  // Ambil nilainya saja (aman jika null)
  const lastValue = () => lastItem()?.value ?? 0;

  // --- 3. LOGIKA HITUNG WAKTU (Time Ago) ---
  const timeAgo = () => {
    const item = lastItem();
    
    // Pastikan item ada dan memiliki properti 'timestamp'
    // (Note: Pastikan di store.js Anda juga menyimpan timestamp: Date.now())
    if (!item || !item.timestamp) return null; 
    
    // Hitung selisih: Waktu Sekarang - Waktu Data Masuk
    const diff = Math.floor((now() - item.timestamp) / 1000);
    return diff >= 0 ? diff : 0; // Cegah angka negatif
  };

  // Cek apakah nilai melebihi batas (Limit) -> BOOLEAN (untuk warna chart)
  const hasError = () => {
    const val = lastValue();
    switch (props.title) {
      case "Suhu": 
        return val < LIMITS.suhuMin || val > LIMITS.suhuMax;
      
      case "Kelembapan": 
        return val < LIMITS.kelembapanMin || val > LIMITS.kelembapanMax;
        
      case "Kebisingan": 
        return val > LIMITS.kebisinganMax;
        
      case "Cahaya": 
        return val < LIMITS.cahayaMin; 
        
      default: return false;
    }
  };

  // --- LOGIKA PESAN ERROR SPESIFIK (BARU) ---
  // Menentukan teks pesan berdasarkan jenis pelanggaran batas
  const getErrorMessage = () => {
    const val = lastValue();
    
    switch (props.title) {
      case "Suhu":
        if (val > LIMITS.suhuMax) return "Terlalu Panas!";
        if (val < LIMITS.suhuMin) return "Terlalu Dingin!";
        break;
        
      case "Kelembapan":
        if (val > LIMITS.kelembapanMax) return "Terlalu Lembab!"; // Berisiko Jamur
        if (val < LIMITS.kelembapanMin) return "Terlalu Kering!"; // Kertas Rapuh
        break;
        
      case "Kebisingan":
        if (val > LIMITS.kebisinganMax) return "Terlalu Bising!";
        break;
        
      case "Cahaya":
        if (val < LIMITS.cahayaMin) return "Kurang Cahaya!";
        break;
    }
    return "Kondisi Tidak Ideal"; // Fallback default
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

  // --- 4. LOGIKA CHART.JS ---
  const initChart = () => {
    if (!canvasRef) return;
    if (chartInstance) chartInstance.destroy();

    const ctx = canvasRef.getContext("2d");

    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: props.data.map(d => d.time), 
        datasets: [
          {
            label: props.title,
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
            display: true, 
            ticks: { maxTicksLimit: 5, font: { size: 10 } },
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
        // Update Data Real-time
        chartInstance.data.labels = props.data.map(d => d.time);
        chartInstance.data.datasets[0].data = props.data.map(d => d.value);
        
        // Update Warna (Merah jika error)
        chartInstance.data.datasets[0].borderColor = hasError() ? "#ef4444" : "#2563eb";
        chartInstance.data.datasets[0].backgroundColor = hasError() ? "rgba(239, 68, 68, 0.2)" : "rgba(37, 99, 235, 0.2)";
        
        chartInstance.update();
      }
    }
  });

  onCleanup(() => {
    clearInterval(timer);
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  });

  return (
    <div class="sensor-block">
      <div class="chart-card" classList={{ "is-error": hasError() }}>
        <h3 class="chart-title">{props.title}</h3>

        {/* --- TAMPILAN UTAMA (GRAFIK ATAU ANGKA) --- */}
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

        {/* --- BADGE ERROR (UPDATED) --- */}
        {/* Sekarang memanggil getErrorMessage() agar pesan lebih spesifik */}
        <Show when={hasError()}>
          <div class="error-badge">
            {getErrorMessage()}
          </div>
        </Show>

        {/* --- FOOTER: WAKTU YANG LALU --- */}
        <div style={{
            "font-size": "0.75rem", 
            "color": hasError() ? "#ef4444" : "#64748b", 
            "margin-top": "12px", 
            "text-align": "center",
            "font-weight": "600",
            "font-family": "monospace" 
        }}>
          {timeAgo() !== null 
            ? `Terakhir diubah: ${timeAgo()} detik yang lalu`
            : "Menunggu data baru..." 
          }
        </div>

      </div>

      {/* --- TOMBOL GANTI VIEW --- */}
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