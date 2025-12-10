export const DATA_PERPUSTAKAAN = {
  "R01": {
    nama: "Ruang Baca Umum",
    labels: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"],
    suhu: [24, 25, 26, 27, 26, 28],
    kelembapan: [60, 55, 50, 45, 50, 55],
    cahaya: [300, 350, 400, 450, 400, 300],
    kebisingan: [30, 40, 45, 50, 40, 35]
  },
  "R02": {
    nama: "Ruang Multimedia",
    labels: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"],
    suhu: [20, 21, 21, 22, 22, 21],
    kelembapan: [40, 40, 42, 41, 40, 40],
    cahaya: [200, 200, 200, 200, 200, 200],
    kebisingan: [50, 55, 60, 65, 55, 50]
  }
};

export const LIMITS = { suhuMax: 26, kebisinganMax: 60 };