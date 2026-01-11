import { createSignal, createResource, For, Show, createMemo } from "solid-js";
import "./Analysis.css";

// Fetch data dengan senseId='all'
const fetchAllHistory = async ({ roomId, days }) => {
  const response = await fetch(
    `http://localhost:3000/api/history?roomId=${roomId}&senseId=all&days=${days}`
  );
  if (!response.ok) throw new Error("Gagal mengambil data");
  return response.json();
};

export default function Analysis() {
  const ROOMS = [
    { id: "all", name: "Semua Ruangan" },
    { id: 1, name: "Ruang Barat (R01)" },
    { id: 2, name: "Ruang Selatan (R02)" }
  ];

  // Metadata Sensor untuk label dan satuan
  const SENSORS_META = {
    1: { name: "SUHU", unit: "°C", color: "blue" },
    2: { name: "KELEMBAPAN", unit: "%", color: "green" },
    3: { name: "CAHAYA", unit: "Lux", color: "orange" },
    4: { name: "KEBISINGAN", unit: "dB", color: "purple" }
  };

  const [selectedRoomId, setSelectedRoomId] = createSignal("all");
  const [timeRange, setTimeRange] = createSignal("30"); // Default 30 hari

  // 1. Fetch Data Mentah Campuran
  const [data] = createResource(
    () => ({ roomId: selectedRoomId(), days: timeRange() }),
    fetchAllHistory
  );

  // 2. Logic Pengelompokan & Perhitungan Statistik
  const sensorStats = createMemo(() => {
    const history = data();
    if (!history || history.length === 0) return [];

    // Langkah A: Grouping data berdasarkan sense_id
    // Hasil: { "1": [20, 21, 22], "2": [50, 55, 60] }
    const groupedData = history.reduce((acc, row) => {
      const id = row.sense_id;
      if (!acc[id]) acc[id] = [];
      acc[id].push(Number(row.sense_value));
      return acc;
    }, {});

    // Langkah B: Hitung statistik untuk tiap grup
    return Object.keys(groupedData).map((senseId) => {
      const values = groupedData[senseId];
      const sum = values.reduce((a, b) => a + b, 0);
      const meta = SENSORS_META[senseId] || { name: `Sensor ${senseId}`, unit: "", color: "gray" };

      return {
        id: senseId,
        name: meta.name,
        unit: meta.unit,
        color: meta.color,
        count: values.length,
        avg: (sum / values.length).toFixed(1),
        max: Math.max(...values),
        min: Math.min(...values)
      };
    });
  });

  return (
    <div class="analysis-page">
      <header class="page-header">
        <h1>Analisis</h1>
        <p>Statistik Sederhana</p>
      </header>

      {/* Filter Sederhana (Hanya Ruangan & Waktu) */}
      <div class="simple-filter">
        <select value={selectedRoomId()} onChange={(e) => setSelectedRoomId(e.target.value)}>
          <For each={ROOMS}>{(r) => <option value={r.id}>{r.name}</option>}</For>
        </select>

        <select value={timeRange()} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="1">24 Jam Terakhir</option>
          <option value="7">7 Hari Terakhir</option>
          <option value="30">30 Hari Terakhir</option>
        </select>
      </div>

      <div class="dashboard-grid">
        <Show when={data.loading}>
          <div class="loading">Sedang menghitung data...</div>
        </Show>

        <Show when={!data.loading && sensorStats().length === 0}>
          <div class="empty">Tidak ada data pada periode ini.</div>
        </Show>

        {/* Looping Kartu Statistik per Sensor */}
        <For each={sensorStats()}>
          {(stat) => (
            <div class={`sensor-card theme-${stat.color}`}>
              <div class="card-header">
                <h3>{stat.name}</h3>
                <span class="sample-count">{stat.count} Sampel</span>
              </div>
              
              <div class="stats-row">
                <div class="stat-item main">
                  <span class="label">Rata-Rata</span>
                  <span class="value">{stat.avg} <small>{stat.unit}</small></span>
                </div>
                <div class="mini-stats">
                  <div class="stat-item">
                    <span class="label">Min</span>
                    <span class="value">{stat.min}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Max</span>
                    <span class="value">{stat.max}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}