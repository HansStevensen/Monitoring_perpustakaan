CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_name VARCHAR(100) NOT NULL
);

CREATE TABLE senseTable (
    id SERIAL PRIMARY KEY,
    sense_name VARCHAR(100) NOT NULL
);

CREATE TABLE sensing (
    id SERIAL PRIMARY KEY,
    sense_id INT NOT NULL,
    sense_value FLOAT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    room_id INT NOT NULL,
    -- Foreign Key diletakkan setelah kolom didefinisikan
    CONSTRAINT fk_room FOREIGN KEY (room_id) REFERENCES rooms(id),
    CONSTRAINT fk_sense FOREIGN KEY (sense_id) REFERENCES senseTable(id)
);

--masukin data
INSERT INTO senseTable (id, sense_name) VALUES
(1, 'temperature'),
(2, 'humidity'),
(3, 'light_intensity'),
(4, 'sound_proof');

--dua ruangan
INSERT INTO rooms (id, room_name) VALUES
(1, 'Ruang Barat (R01)'),
(2, 'Ruang Selatan (R02)');

-- Contoh data riwayat awal (Optional)
INSERT INTO sensing (sense_id, sense_value, room_id) VALUES
(1, 22.5, 1),
(2, 45.0, 1),
(1, 23.0, 2),
(2, 50.0, 2);