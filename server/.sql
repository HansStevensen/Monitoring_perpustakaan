-- 1. Buat tabel referensi utama dulu (Lantai & Jenis Sensor)
CREATE TABLE floors (
    id SERIAL PRIMARY KEY,
    floor_name VARCHAR(50) NOT NULL
);

CREATE TABLE senseTable (
    id SERIAL PRIMARY KEY,
    sense_name VARCHAR(100) NOT NULL
);

-- 2. Buat tabel ruangan (Sudah include floor_id)
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_name VARCHAR(100) NOT NULL,
    floor_id INT,
    CONSTRAINT fk_floor FOREIGN KEY (floor_id) REFERENCES floors(id)
);

-- 3. Buat tabel transaksi (Sensing)
CREATE TABLE sensing (
    id SERIAL PRIMARY KEY,
    sense_id INT NOT NULL,
    sense_value FLOAT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    room_id INT NOT NULL,
    CONSTRAINT fk_room FOREIGN KEY (room_id) REFERENCES rooms(id),
    CONSTRAINT fk_sense FOREIGN KEY (sense_id) REFERENCES senseTable(id)
);

--- ISI DATA ---

-- Masukkan Lantai
INSERT INTO floors (id, floor_name) VALUES 
(1, 'Lantai 1'), 
(2, 'Lantai 2');

-- Masukkan Jenis Sensor
INSERT INTO senseTable (id, sense_name) VALUES
(1, 'temperature'),
(2, 'humidity'),
(3, 'light_intensity'),
(4, 'sound_proof');

-- Masukkan 8 Ruangan (4 di Lantai 1, 4 di Lantai 2)
INSERT INTO rooms (id, room_name, floor_id) VALUES
(1, 'Ruang Barat 1 (R01)', 1),
(2, 'Ruang Barat 2 (R02)', 1),
(3, 'Ruang Timur 1 (R03)', 1),
(4, 'Ruang Timur 2 (R04)', 1),
(5, 'Ruang Koleksi Umum (R05)', 2),
(6, 'Ruang Belajar Mandiri (R06)', 2),
(7, 'Ruang Diskusi A (R07)', 2),
(8, 'Ruang Diskusi B (R08)', 2);

-- Masukkan Contoh Data Awal
INSERT INTO sensing (sense_id, sense_value, room_id) VALUES
(1, 22.5, 1),
(2, 45.0, 1),
(1, 23.0, 5), -- Contoh data di Lantai 2
(2, 50.0, 5);