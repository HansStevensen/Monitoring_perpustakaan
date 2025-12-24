import { createStore } from "solid-js/store";
import { DATA_PERPUSTAKAAN } from "./data";

//inisialisasi global store menggunakan data awal dari data.js
export const [globalData, setGlobalData] = createStore(DATA_PERPUSTAKAAN);

// Fungsi helper buat update data dari socket
export function updateSensorData(roomId, tipe, nilai) {
    //gabungin data lama dengan nilai baru ke dalam array
    setGlobalData(roomId, tipe, (prev) => {
        const baru = [...prev, nilai];
        //ini fungsi buat menghapus data yang paling lama,jika panjangnnya udah lebih dari 20 item
        if (baru.length > 20) baru.shift(); // Jaga biar gak berat
        return baru;
    });
}