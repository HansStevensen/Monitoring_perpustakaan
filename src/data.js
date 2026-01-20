/* src/data.js */

export const FLOORS = [
  { id: 1, name: "Lantai 1" },
  { id: 2, name: "Lantai 2" }
];

export const DATA_PERPUSTAKAAN = {
  // LANTAI 1
  "R01": { nama: "Ruang Barat 1", floorId: 1, suhu: [], kelembapan: [], cahaya: [], kebisingan: [] },
  "R02": { nama: "Ruang Barat 2", floorId: 1, suhu: [], kelembapan: [], cahaya: [], kebisingan: [] },
  "R03": { nama: "Ruang Timur 1", floorId: 1, suhu: [], kelembapan: [], cahaya: [], kebisingan: [] },
  "R04": { nama: "Ruang Timur 2", floorId: 1, suhu: [], kelembapan: [], cahaya: [], kebisingan: [] },
  
  // LANTAI 2
  "R05": { nama: "Ruang Koleksi Umum", floorId: 2, suhu: [], kelembapan: [], cahaya: [], kebisingan: [] },
  "R06": { nama: "Ruang Belajar Mandiri", floorId: 2, suhu: [], kelembapan: [], cahaya: [], kebisingan: [] },
  "R07": { nama: "Ruang Diskusi A", floorId: 2, suhu: [], kelembapan: [], cahaya: [], kebisingan: [] },
  "R08": { nama: "Ruang Diskusi B", floorId: 2, suhu: [], kelembapan: [], cahaya: [], kebisingan: [] }
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