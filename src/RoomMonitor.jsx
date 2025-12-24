import { useParams } from "@solidjs/router";
import { Show} from "solid-js";
import { globalData } from "./store"; 
import "./RoomMonitor.css";
import ChartCard from "./components/ChartCard";//import komponen ChartCard untuk menampilkan masing-masing item (suhu dll)


export default function RoomMonitor() {
  //useParams dipake untuk ngambil parameter dinamis dari url
  const params = useParams();
  
  // Mengambil data ruangan berdasarkan ID di URL (R01, R02, dst)
  //mengambil data dari ID yang ada
  const roomData = () => {
    const id = params.id ? params.id.toUpperCase() : "";
    return globalData[id];
  };

  //show dipake untuk nampilin data, dan ada fallback semisalnya gaada ruangannya
  return (
    <Show 
      when={roomData()} 
      fallback={<div class="not-found-msg">Ruangan tidak ditemukan atau data belum dimuat.</div>}
    >
      <div class="monitor-container">
        <h2 class="status-title">Monitoring: {roomData().nama}</h2>

        <div class="dashboard-grid">
          <ChartCard title="Suhu" data={roomData().suhu} />
          <ChartCard title="Kelembapan" data={roomData().kelembapan} />
          <ChartCard title="Cahaya" data={roomData().cahaya} />
          <ChartCard title="Kebisingan" data={roomData().kebisingan} />
        </div>
      </div>
    </Show>
  );
}