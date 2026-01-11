/* src/store.js */
import { createStore } from "solid-js/store";
import { DATA_PERPUSTAKAAN } from "./data";

export const [globalData, setGlobalData] = createStore(DATA_PERPUSTAKAAN);

export function updateSensorData(roomId, tipe, nilai) {
    // 1. Ambil waktu saat ini (Jam:Menit:Detik)
    const waktuSekarang = new Date().toLocaleTimeString("id-ID", {
        hour12: false, 
        hour: "2-digit", 
        minute: "2-digit", 
        second: "2-digit"
    });

    // 2. Simpan data sebagai OBJEK (Nilai + Waktu)
    setGlobalData(roomId, tipe, (prev) => {
        const newData = {
            value: nilai,
            time: waktuSekarang,
            timestamp: Date.now()
        };

        const baru = [...prev, newData];
        
        // Batasi maksimal 20 data agar memori hemat
        if (baru.length > 20) baru.shift(); 
        
        return baru;
    });
}