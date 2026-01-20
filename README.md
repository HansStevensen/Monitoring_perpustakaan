# Aplikasi Pemantauan Kebisingan dan Pencahayaan Perpustakaan Unpar
Aplikasi dashboard berbasis web untuk memantau tingkat kebisingan dan pencahayaan di Perpustakaan Unpar secara real-time. Proyek ini merupakan bagian dari Tugas Besar Mata Kuliah Internet of Things.

## Latar Belakang
Perpustakaan Unpar merupakan tempat bagi para mahasiswa untuk membaca buku, mengerjakan tugas, maupun bersantai sambil menunggu kelas kuliah. Perpustakaan harus memiliki kondisi yang tenang dan nyaman agar mahasiswa dapat melakukan aktivitasnya dengan baik. Terdapat dua parameter dari perpustakaan, yang dapat mempengaruhi ketenangan dan kenyamanan perpustakaan, yaitu tingkat kebisingan dan pencahayaan.

Apabila tingkat kebisingan melebihi batas yang sewajarnya, maka konsentrasi mahasiswa di perpustakaan dapat terganggu karena suara yang terlalu bising. Lalu, apabila tingkat pencahayaan di perpustakaan kurang terang, dapat mengganggu kenyamanan mahasiswa dalam melakukan aktivitas di perpustakaan, karena kondisi ruangan yang relatif gelap.

Menurut Peraturan Menteri Lingkungan Hidup KEP-48/MENLH/11/1996, nilai kebisingan maksimal yang direkomendasikan pada ruang perpustakaan adalah sebesar 55dB. Selanjutnya, menurut standar pada SNI 6197:2020 mengenai tingkat minimal pencahayaan, tingkat pencahayaan rata-rata minimum pada ruang baca perpustakaan adalah 350 lux.

Oleh karena itu, perlu dibangun suatu aplikasi pemantauan kebisingan dan pencahayaan perpustakaan, yang dapat menggambarkan lokasi mana saja dalam perpustakaan yang sering terdapat kebisingan maupun pencahayaan yang kurang, agar pihak universitas dapat memantau dan mengambil tindakan lanjut dari hasil pemantauan aplikasi.

## Teknologi yang Digunakan
- Frontend: [SolidJS] dengan Vite
- Backend: Node.js
- Database: PostgreSQL
- IoT Protocol: MQTT / MQTT-SN

## Instalasi dan Konfigurasi
1. Prasyarat

Pastikan Anda telah menginstal Node.js dan PostgreSQL di sistem Anda.

2. Instalasi Dependensi

Kloning repositori proyek dan instal semua dependensi yang diperlukan:

# Kloning repositori

git clone https://github.com/HansStevensen/Monitoring_perpustakaan

cd Monitoring_perpustakaan

# Install dependensi
```bash
npm install
npm run dev
```

3. Konfigurasi Environment Variables

Buat file .env di root direktori proyek dengan isi berikut:
```bash
DB_USER=postgres
DB_HOST=localhost
DB_NAME=perpustakaan_iot
DB_USER_PASSWORD=postgres
```

Catatan: Sesuaikan nilai-nilai tersebut dengan konfigurasi database PostgreSQL Anda.

4. Setup Database

Pastikan PostgreSQL service sedang berjalan

Buat database sesuai dengan nama yang didefinisikan di file .env (default: perpustakaan_iot)

Jalankan file SQL (.sql) yang disediakan dalam proyek untuk membuat tabel-tabel yang diperlukan

5. Mode Pengembangan (Development)

Jalankan server pengembangan lokal dengan fitur Hot Module Replacement (HMR) untuk kemudahan live-reloading saat Anda melakukan perubahan pada kode:

```bash
npm run dev
```

Aplikasi akan tersedia dan dapat diakses melalui browser Anda pada alamat berikut: http://localhost:5173.

6. Produksi (Building for Production)

Untuk membuat build statis yang siap di-deploy ke lingkungan produksi, jalankan perintah build:

```bash
npm build
```

Hasil build yang telah dioptimalkan akan tersimpan dalam direktori dist. File ini siap untuk di-hosting di server manapun.