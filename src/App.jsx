/* src/App.jsx */
import { createEffect, Show } from "solid-js";
import { createStore } from "solid-js/store"; 
import { Router, Route, A } from "@solidjs/router";
import io from "socket.io-client"; 

// IMPORT INI PENTING: Kita pakai globalData, jangan bikin store baru
import { updateSensorData, globalData } from "./store"; 
import { LIMITS } from "./data";

import AlertPopUp from "./components/AlertPopUp";
import "./App.css";

function App(props) {
  // HAPUS BARIS INI: const [store, setStore] = createStore(initialData);
  // Kita ganti semua referensi 'store' menjadi 'globalData'

  // Signal alert (ini boleh lokal karena UI state)
  const [alertInfo, setAlertInfo] = createStore({ message: null }); 

  // --- LOGIKA KONEKSI SOCKET.IO ---
  createEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
      console.log("Frontend: Berhasil konek ke Backend IoT!");
    });

    socket.on("updateSensor", (data) => {
      // Ini sudah benar, dia update Global Store
      updateSensorData(data.roomId, data.tipe, data.nilai);
    });

    return () => socket.disconnect();
  });

  // --- Logika Alert Global ---
  createEffect(() => {
    // PERBAIKAN: Ganti 'store' jadi 'globalData'
    // Sekarang Alert memantau data yang sama dengan Socket!
    Object.keys(globalData).forEach((roomId) => {
      const room = globalData[roomId]; // Akses globalData
      
      // Safety check: Pastikan array ada isinya sebelum diakses
      if (room.suhu.length > 0 && room.kebisingan.length > 0) {
          const currentSuhu = room.suhu[room.suhu.length - 1];
          const currentNoise = room.kebisingan[room.kebisingan.length - 1];
    
          if (currentNoise > LIMITS.kebisinganMax) {
             setAlertInfo({ message: `⚠️ BISING: ${room.nama} (${currentNoise} dB)!` });
          } else if (currentSuhu > LIMITS.suhuMax) {
             setAlertInfo({ message: `PANAS: ${room.nama} (${currentSuhu}°C)!` });
          }
      }
    });
  });

  return (
    <div class="app-container">
      <Show when={alertInfo.message}>
        <AlertPopUp message={alertInfo.message} onClose={() => setAlertInfo({ message: null })} />
      </Show>

      <header class="app-header">
        <h1 class="app-title">Monitoring IoT Perpustakaan</h1>
        <p class="app-subtitle">Real-time Data via MQTT & WebSocket</p>
      </header>

      <div class="nav-container">
        {/* PERBAIKAN: Looping menggunakan globalData */}
        {Object.keys(globalData).map((id) => (
          <A href={`/${id}`} class="nav-button" activeClass="active" end>
            {globalData[id].nama}
          </A>
        ))}
      </div>

      <div class="content-area">
        {props.children} 
      </div>
    </div>
  );
}

export default App;