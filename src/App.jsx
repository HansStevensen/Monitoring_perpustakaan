/* src/App.jsx */
import { createEffect, Show, createMemo,createSignal,For } from "solid-js";
import { A, useLocation,useNavigate} from "@solidjs/router";
import io from "socket.io-client";
import { FLOORS } from "./data";

import RunningAlert from "./components/RunningAlert";
import { updateSensorData, globalData } from "./store"; 
import { LIMITS } from "./data";
import "./App.css";

function App(props) {
  const location = useLocation();
  const [activeFloor, setActiveFloor] = createSignal(1);
  const navigate = useNavigate();

 //logika connect socket io
  createEffect(() => {
    const socket = io("http://localhost:3000");
    socket.on("connect", () => {
      console.log("Frontend: Berhasil terhubung ke Backend!");
    });
    socket.on("updateSensor", (data) => {
      updateSensorData(data.roomId, data.tipe, data.nilai);
    });
    return () => socket.disconnect();
  });

  //logika alert global untuk 4 sensor
  const finalMessage = createMemo(() => {
    let allIssues = [];
    const activeRoomId = location.pathname.replace("/", "").toUpperCase();

    Object.keys(globalData).forEach((roomId) => {
      const room = globalData[roomId];
      
      // Filter: Hanya cek ruangan yang sedang TIDAK dibuka user
      // (Supaya notifikasi berjalan ini memberitahu kondisi ruangan SEBELAH)
      if (roomId !== activeRoomId) {
        
        // 1. Cek Suhu
        if (room.suhu.length > 0) {
          const val = room.suhu[room.suhu.length - 1].value; 
          
          if (val > LIMITS.suhuMax) allIssues.push(`Suhu ${room.nama} PANAS (>26°C)`);
          if (val < LIMITS.suhuMin) allIssues.push(`Suhu ${room.nama} DINGIN (<20°C)`);
        }

        // 2. Cek Kebisingan
        if (room.kebisingan.length > 0) {
          const val = room.kebisingan[room.kebisingan.length - 1].value;
          
          if (val > LIMITS.kebisinganMax) {
            allIssues.push(`Kebisingan di ${room.nama} (${val}dB)`);
          }
        }

        // 3. Cek Kelembapan
        if (room.kelembapan.length > 0) {
          const val = room.kelembapan[room.kelembapan.length - 1].value;
          
          if (val > LIMITS.kelembapanMax) allIssues.push(`Kelembapan ${room.nama} TINGGI (>60%)`);
          if (val < LIMITS.kelembapanMin) allIssues.push(`Kelembapan ${room.nama} RENDAH (<40%)`);
        }

        // 4. Cek Cahaya
        if (room.cahaya.length > 0) {
          const val = room.cahaya[room.cahaya.length - 1].value;
          
          if (val < LIMITS.cahayaMin) {
            allIssues.push(`Cahaya ${room.nama} REDUP (<300 Lux)`);
          }
        }
      }
    });

    return allIssues.length > 0 ? allIssues.join("   |   ") : null;
  });

  //logika reset lantai ketika route nya keubah
  createEffect(() => {
    //kalo path nya di history atau analysis maka si activate floor nya akan diberi nilai null
    //agar tampilan lebih bagus
    if (location.pathname === "/history" || location.pathname === "/analysis") {
      setActiveFloor(null);
    }
  });

  //fungsi untuk klik lantai
  const handleFloorClick = (floorId) => {
    setActiveFloor(floorId);
    //kalau lagi ada di path history atau analysis kita ganti dlu ke / 
    if (location.pathname === "/history" || location.pathname === "/analysis") {
      navigate("/");
    }
  };

  return (
    <div class="app-container">
      {/* alert */}
      <Show when={finalMessage()}>
        <RunningAlert message={finalMessage()} />
      </Show>

      {/* header */}
      <header class="app-header">
        <h1 class="app-title">Monitoring IoT Perpustakaan</h1>
        <p class="app-subtitle">Real-time Data via MQTT & WebSocket</p>
      </header>

      <div class="top-nav-bar">
        {/* Tombol Lantai */}
        <For each={FLOORS}>{(floor) => (
          <button 
            class={`nav-button ${activeFloor() === floor.id ? 'active' : ''}`}
            onClick={() => handleFloorClick(floor.id)}
          >
            {floor.name}
          </button>
        )}</For>

        <div class="nav-divider"></div>

        {/* Tombol Menu Global */}
        <A href="/history" class="nav-button" activeClass="active">History</A>
        <A href="/analysis" class="nav-button" activeClass="active">Analisis</A>
      </div>

      {/*navigasi untuk ruangan, harus pilih lantia dulu baru munncul pilihan roomnya */}
      <div class="room-nav-container">
        <Show 
          when={activeFloor()} 
          fallback={<p class="select-prompt">Pilih lantai untuk memantau ruangan secara spesifik</p>}
        >
          <div class="room-buttons">
            <For each={Object.keys(globalData).filter(id => globalData[id].floorId === activeFloor())}>
              {(id) => (
                <A href={`/${id}`} class="nav-button room-btn" activeClass="active">
                  {globalData[id].nama}
                </A>
              )}
            </For>
          </div>
        </Show>
      </div>

      <main class="content-area">
        {props.children}
      </main>
    </div>
  );
}

export default App;