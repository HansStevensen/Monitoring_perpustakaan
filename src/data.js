//data js untuk menyimpan state dan juga metadatanya
export const DATA_PERPUSTAKAAN = {
  "R01": {
    nama: "Ruang Barat",
    labels: [], // Kosongkan, nanti diisi timestamp realtime
    suhu: [30],   // Kosongkan, nanti diisi oleh socket.io
    kelembapan: [0],
    cahaya: [0],
    kebisingan: [61]
  },
  "R02": {
    nama: "Ruang Selatan",
    labels: [0],
    suhu: [0],
    kelembapan: [0],
    cahaya: [300],
    kebisingan: [0]
  }
};
export const LIMITS = { 
  suhuMax: 26, 
  kebisinganMax: 60,
  kelembapanMax: 70,
  cahayaMin: 200
};