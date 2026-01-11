/* src/data.js */
export const DATA_PERPUSTAKAAN = {
  "R01": {
    nama: "Ruang Barat",
    labels: [], 
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

// UPDATE SESUAI REGULASI (Permenkes & SNI)
export const LIMITS = { 
  suhuMin: 20,       // Batas bawah nyaman (Buku & Manusia)
  suhuMax: 26,       // Batas atas (Permenkes No. 48/2016)
  
  kelembapanMin: 40, // Mencegah buku kering/kertas rapuh
  kelembapanMax: 60, // Mencegah jamur (Permenkes No. 48/2016)
  
  kebisinganMax: 55, // Batas bising (Kepmen LH No. 48/1996)
  
  cahayaMin: 300     // Minimal untuk membaca (SNI 6197:2011)
};