/* server.js */
import 'dotenv/config'; 
import mqtt from "mqtt";
import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import pool from "./db.js"; 

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // URL Vite Frontend
    methods: ["GET", "POST"]
  }
});

// --- MAPPING DATA ---
const ROOM_MAP = { 
  "R01": 1, "R02": 2, "R03": 3, "R04": 4, //room lt 1
  "R05": 5, "R06": 6, "R07": 7, "R08": 8  //room lt2
};

const SENSE_MAP = { 
  "suhu": 1, 
  "kelembapan": 2, 
  "cahaya": 3, 
  "kebisingan": 4 
};

// --- KONFIGURASI MQTT (GANTI BAGIAN INI) ---
const MQTT_HOST = 'localhost'; // Gunakan localhost
const MQTT_PORT = 1883;        // Port default
const MQTT_USER = '';          // Kosongkan jika tanpa password
const MQTT_PASS = '';          // Kosongkan jika tanpa password

const mqttOptions = {
    port: MQTT_PORT,
    protocol: 'mqtt', // Ubah dari 'mqtts' ke 'mqtt' (Tanpa SSL)
};

// Tambahkan user/pass ke options HANYA jika diisi
if (MQTT_USER) mqttOptions.username = MQTT_USER;
if (MQTT_PASS) mqttOptions.password = MQTT_PASS;

// Hubungkan client (Perhatikan: mqtt:// bukan mqtts://)
const mqttClient = mqtt.connect(`mqtt://${MQTT_HOST}`, mqttOptions);

mqttClient.on('connect', () => {
    console.log(`[SERVER] BERHASIL Terhubung ke Mosquitto Lokal!`);
    // Subscribe ke pola topik: sensor/NamaRuang/JenisSensor
    mqttClient.subscribe('sensor/+/+'); 
});

mqttClient.on('error', (err) => {
    console.error(`[SERVER] Error Koneksi MQTT:`, err.message);
});

mqttClient.on('offline', () => {
    console.log(`[SERVER] Koneksi MQTT terputus, mencoba menyambung ulang...`);
});

mqttClient.on('message', async (topic, message) => {
    // Topik yang diharapkan: sensor/R01/suhu
    console.log(`[TERIMA] ${topic} -> ${message.toString()}`); // Debugging log

    const nilai = parseFloat(message.toString());
    const parts = topic.split('/'); 
    
    // Validasi struktur topik (harus 3 bagian)
    if (parts.length === 3) {
        const prefix = parts[0];   // "sensor"
        const roomCode = parts[1]; // "R01"
        const typeStr = parts[2];  // "suhu"
        
        // 1. Kirim data langsung ke dashboard (Realtime)
        io.emit('updateSensor', { roomId: roomCode, tipe: typeStr, nilai: nilai });

        // 2. Simpan ke database
        const roomId = ROOM_MAP[roomCode];
        const senseId = SENSE_MAP[typeStr];

        if (roomId && senseId) {
            try {
                await pool.query(
                    'INSERT INTO sensing (sense_id, sense_value, room_id) VALUES ($1, $2, $3)',
                    [senseId, nilai, roomId]
                );
                // console.log("Data disimpan ke DB");
            } catch (err) {
                console.error('❌ DB Insert Error:', err.message);
            }
        } else {
            console.warn(`⚠️ ID Ruang atau Sensor tidak dikenali: ${roomCode}, ${typeStr}`);
        }
    }
});

// --- API ENDPOINTS ---
app.get('/api/history', async (req, res) => {
    const { floorId, roomId, senseId, days } = req.query;

    try {
        const queryText = `
            SELECT s.recorded_at, s.sense_value, s.room_id, s.sense_id, r.floor_id
            FROM sensing s
            JOIN rooms r ON s.room_id = r.id
            WHERE ($1 = 'all' OR r.floor_id = $1::int)
            AND ($2 = 'all' OR s.room_id = $2::int)
            AND ($3 = 'all' OR s.sense_id = $3::int)
            AND ($4 = 'all' OR s.recorded_at >= NOW() - ($4 || ' day')::INTERVAL)
            ORDER BY s.recorded_at DESC
            LIMIT 500;
        `;
        
        const result = await pool.query(queryText, [floorId, roomId, senseId, days]);
        res.json(result.rows);
    } catch (err) {
        console.error('DB Select Error:', err.message);
        res.status(500).json({ error: "Gagal mengambil riwayat" });
    }
});

server.listen(3000, () => {
    console.log('Server berjalan di http://localhost:3000');
});