/* src/store.js */
import { createStore } from "solid-js/store";
import { DATA_PERPUSTAKAAN } from "./data";

// Bikin Store Global
export const [globalData, setGlobalData] = createStore(DATA_PERPUSTAKAAN);

// Fungsi helper buat update data dari socket
export function updateSensorData(roomId, tipe, nilai) {
    setGlobalData(roomId, tipe, (prev) => {
        const baru = [...prev, nilai];
        if (baru.length > 20) baru.shift(); // Jaga biar gak berat
        return baru;
    });
}