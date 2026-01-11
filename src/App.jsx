/* src/App.jsx */
import { createEffect, Show, createMemo } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import io from "socket.io-client";

import RunningAlert from "./components/RunningAlert";
import { updateSensorData, globalData } from "./store"; 
import { LIMITS } from "./data";
import "./App.css";

function App(props) {
  const location = useLocation();

  // --- 1. LOGIKA KONEKSI SOCKET.IO ---
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

  // --- 2. LOGIKA ALERT GLOBAL (LENGKAP 4 SENSOR) ---
  const finalMessage = createMemo(() => {
    let allIssues = [];
    const activeRoomId = location.pathname.replace("/", "").toUpperCase();

    Object.keys(globalData).forEach((roomId) => {
      const room = globalData[roomId];
      
      // Filter: Hanya cek ruangan yang sedang tidak dibuka user
      if (roomId !== activeRoomId) {
        
        // 1. Cek Suhu (Range 20 - 26)
        if (room.suhu.length > 0) {
          const val = room.suhu[room.suhu.length - 1];
          if (val > LIMITS.suhuMax) allIssues.push(`Suhu ${room.nama} PANAS (>26°C)`);
          if (val < LIMITS.suhuMin) allIssues.push(`Suhu ${room.nama} DINGIN (<20°C)`);
        }

        // 2. Cek Kebisingan (Max 55)
        if (room.kebisingan.length > 0) {
          const val = room.kebisingan[room.kebisingan.length - 1];
          if (val > LIMITS.kebisinganMax) {
            allIssues.push(`Kebisingan di ${room.nama} (${val}dB)`);
          }
        }

        // 3. Cek Kelembapan (Range 40 - 60)
        if (room.kelembapan.length > 0) {
          const val = room.kelembapan[room.kelembapan.length - 1];
          if (val > LIMITS.kelembapanMax) allIssues.push(`Kelembapan ${room.nama} TINGGI (>60%)`);
          if (val < LIMITS.kelembapanMin) allIssues.push(`Kelembapan ${room.nama} RENDAH (<40%)`);
        }

        // 4. Cek Cahaya (Min 300)
        if (room.cahaya.length > 0) {
          const val = room.cahaya[room.cahaya.length - 1];
          if (val < LIMITS.cahayaMin) {
            allIssues.push(`Cahaya ${room.nama} REDUP (<300 Lux)`);
          }
        }
      }
    });

    return allIssues.length > 0 ? allIssues.join("   |   ") : null;
  });

  return (
    <div class="app-container">
      <Show when={finalMessage()}>
        <RunningAlert message={finalMessage()} />
      </Show>

      <header class="app-header">
        <h1 class="app-title">Monitoring IoT Perpustakaan</h1>
        <p class="app-subtitle">Real-time Data via MQTT & WebSocket</p>
      </header>

      <div class="nav-container">
        {Object.keys(globalData).map((id) => (
          <A href={`/${id}`} class="nav-button" activeClass="active" end>
            {globalData[id].nama}
          </A>
        ))}

        <A href="/history" class="nav-button history-btn" activeClass="active">
        History</A>
        <A href="/analysis" class="nav-button">Analisis</A>
      </div>

      <main class="content-area">
        {props.children} 
      </main>
    </div>
  );
}

export default App;