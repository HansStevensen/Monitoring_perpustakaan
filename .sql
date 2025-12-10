CREATE TABLE rooms{
    id SERIAL PRIMARY KEY,
    room_name VARCHAR(100) NOT NULL,
}

CREATE TABLE senseTable{
    id SERIAL PRIMARY KEY,
    sense_name VARCHAR(100) NOT NULL,
}

INSERT INTO senseTable VALUES
(1, 'temperature'),
(2, 'humidity'),
(3, 'light_intensity'),
(4, 'sound_proof');

CREATE TABLE sensing{
    id SERIAL PRIMARY KEY,
    sense_id INT NOT NULL,
    sense_value FLOAT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
    room_id INT NOT NULL,
}


INSERT INTO rooms VALUES
(1, 'Room 101'),
(2, 'Room 102'),
(3, 'Room 103');

INSERT INTO sensing (sense_id, sense_value, room_id) VALUES
(1, 22.5, 1),
(2, 45.0, 1),
(3, 300.0, 1),
(4, 35.0, 1),
(1, 23.0, 2),
(2, 50.0, 2),
(3, 280.0, 2),
(4, 40.0, 2),
(1, 21.5, 3),
(2, 55.0, 3),
(3, 320.0, 3),
(4, 30.0, 3);