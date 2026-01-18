/* src/History.jsx */
import { createSignal, createResource, For, Show,createMemo} from "solid-js";
import "./History.css";
import { FLOORS } from "./data";

// Fungsi untuk mengambil data asli dari Backend API
const fetchHistory = async ({floorId ,roomId, senseId, days }) => {
  const response = await fetch(
    `http://localhost:3000/api/history?floorId=${floorId}&roomId=${roomId}&senseId=${senseId}&days=${days}`
  );
  if (!response.ok) throw new Error("Gagal mengambil data dari server");
  return response.json();
};

export default function History() {
  
  const ROOMS = [
    { id: "all", name: "Semua Ruangan", floorId: "all" },
    { id: 1, name: "Ruang Barat 1 (R01)", floorId: 1 },
    { id: 2, name: "Ruang Barat 2 (R02)", floorId: 1 },
    { id: 3, name: "Ruang Timur 1 (R03)", floorId: 1 },
    { id: 4, name: "Ruang Timur 2 (R04)", floorId: 1 },
    { id: 5, name: "Ruang Koleksi Umum (R05)", floorId: 2 },
    { id: 6, name: "Ruang Belajar Mandiri (R06)", floorId: 2 },
    { id: 7, name: "Ruang Diskusi A (R07)", floorId: 2 },
    { id: 8, name: "Ruang Diskusi B  (R08)", floorId: 2 }
  ];

  const SENSORS = [
    { id: "all", name: "Semua Sensor", unit: "" },
    { id: 1, name: "Temperature", unit: "°C" },
    { id: 2, name: "Humidity", unit: "%" },
    { id: 3, name: "Light Intensity", unit: "Lux" },
    { id: 4, name: "Sound Proof", unit: "dB" }
  ];

  // State Filters
  const [selectedRoomId, setSelectedRoomId] = createSignal("all");
  const [selectedSenseId, setSelectedSenseId] = createSignal("all");
  const [timeRange, setTimeRange] = createSignal("all");
  const [selectedFloorId, setSelectedFloorId] = createSignal("all");

  // createResource: Otomatis panggil API setiap kali filter berubah
  const [data] = createResource(
    () => ({
      floorId: selectedFloorId(), 
      roomId: selectedRoomId(), 
      senseId: selectedSenseId(), 
      days: timeRange() 
    }),
    fetchHistory
  );

  // Helper untuk mendapatkan Nama Ruangan & Satuan berdasarkan ID dari Database
  const getRoomName = (id) => {
    const room = ROOMS.find(r => r.id === Number(id));
    return room ? room.name : "N/A";
  };

  const getUnit = (id) => {
    const sensor = SENSORS.find(s => s.id === Number(id));
    return sensor ? sensor.unit : "";
  };

  const filteredRooms = createMemo(() => {
    if (selectedFloorId() === "all") return ROOMS;
    return ROOMS.filter(r => r.floorId === Number(selectedFloorId()) || r.id === "all");
  });

  return (
    <div class="history-container">
      <div class="filter-row">
        {/* DROPDOWN LANTAI */}
        <div class="filter-item">
          <label>Lantai</label>
          <select 
            value={selectedFloorId()} 
            onChange={(e) => {
                setSelectedFloorId(e.target.value);
                setSelectedRoomId("all"); // Reset ruangan ke 'all' jika lantai berubah
            }}
          >
            <option value="all">Semua Lantai</option>
            <For each={FLOORS}>{(f) => <option value={f.id}>{f.name}</option>}</For>
          </select>
        </div>

        {/* 4. GUNAKAN filteredRooms() BUKAN ROOMS */}
        <div class="filter-item">
          <label>Lokasi Ruangan</label>
          <select value={selectedRoomId()} onChange={(e) => setSelectedRoomId(e.target.value)}>
            <For each={filteredRooms()}>{(r) => <option value={r.id}>{r.name}</option>}</For>
          </select>
        </div>

        <div class="filter-item">
          <label>Jenis Sensor</label>
          <select value={selectedSenseId()} onChange={(e) => setSelectedSenseId(e.target.value)}>
            <For each={SENSORS}>{(s) => <option value={s.id}>{s.name}</option>}</For>
          </select>
        </div>

        <div class="filter-item">
          <label>Rentang Waktu</label>
          <select value={timeRange()} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="all">Semua Riwayat</option>
            <option value="1">24 Jam Terakhir</option>
            <option value="7">7 Hari Terakhir</option>
            <option value="30">30 Hari Terakhir</option>
          </select>
        </div>
      </div>

      <div class="table-card">
        <Show when={!data.loading} fallback={<div class="loading-state">Menghubungkan ke Database...</div>}>
          <table class="history-table">
            <thead>
              <tr>
                <th>Tanggal & Waktu</th>
                <th>Ruangan</th>
                <th>Nilai</th>
                <th>Satuan</th>
              </tr>
            </thead>
            <tbody>
              <For each={data()}>
                {(row) => (
                  <tr>
                    <td>{new Date(row.recorded_at).toLocaleString('id-ID')}</td>
                    <td>{getRoomName(row.room_id)}</td>
                    <td class="value-cell">{row.sense_value}</td>
                    <td class="unit-cell">{getUnit(row.sense_id)}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
          
          <Show when={data()?.length === 0}>
            <div class="empty-state">Data riwayat tidak ditemukan di database.</div>
          </Show>
        </Show>
      </div>
    </div>
  );
}