/* src/RoomMonitor.jsx */
import { useParams } from "@solidjs/router";
import { Show } from "solid-js";
import { DATA_PERPUSTAKAAN } from "./data"; // Import data langsung
import { globalData } from "./store"; // Import Global Data yang Live

function ChartPlaceholder(props) {
  //holder chart nya
  return (
    <div class="chart-card">
      <h3 class="chart-title">{props.title}</h3>
      <p class="chart-subtitle">Area Chart ({props.data.length} items)</p>
      <h2 class="chart-value">
        {props.data[props.data.length - 1]}
        {props.title === "Suhu" ? "°C" : props.title === "Kebisingan" ? " dB" : ""}
      </h2>
    </div>
  );
}

export default function RoomMonitor() {
  const params = useParams();
  
  const roomData = () => {
    // Ambil ID dari URL, ubah ke Huruf Besar biar cocok dengan key Data
    const id = params.id ? params.id.toUpperCase() : "";
    return globalData[id];
  };

  return (
    <Show when={roomData()} fallback={<div style="text-align:center; color:red; margin-top:20px;">Ruangan tidak ditemukan!</div>}>
      <h2 class="status-title">Status: {roomData().nama}</h2>
      <div class="dashboard-grid">
        <ChartPlaceholder title="Suhu" data={roomData().suhu} />
        <ChartPlaceholder title="Kelembapan" data={roomData().kelembapan} />
        <ChartPlaceholder title="Cahaya" data={roomData().cahaya} />
        <ChartPlaceholder title="Kebisingan" data={roomData().kebisingan} />
      </div>
    </Show>
  );
}