/* src/data.js */
export const DATA_PERPUSTAKAAN = {
  "R01": {
    nama: "Ruang Barat",
    labels: [], 
    // Kosongkan data awal agar tidak error saat mapping objek
    suhu: [],
    kelembapan: [],
    cahaya: [],
    kebisingan: []
  },
  "R02": {
    nama: "Ruang Selatan",
    labels: [],
    suhu: [],
    kelembapan: [],
    cahaya: [],
    kebisingan: []
  }
};

export const LIMITS = { 
  suhuMax: 26, 
  kebisinganMax: 60,
  kelembapanMax: 70,
  cahayaMin: 200
};