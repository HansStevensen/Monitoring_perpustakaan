/* server.js */
import 'dotenv/config'; 
import mqtt from "mqtt";
import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import pool from "./db.js"; // Memakai koneksi database dari temanmu

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // URL Vite Frontend
    methods: ["GET", "POST"]
  }
});

/**
 * MAPPING DATA
 * Mengonversi string dari MQTT ke ID Database (Sesuai tabel SQL kamu)
 */
const ROOM_MAP = { "R01": 1, "R02": 2 }; 
const SENSE_MAP = { 
  "suhu": 1, 
  "kelembapan": 2, 
  "cahaya": 3, 
  "kebisingan": 4 
};

// --- 1. KONEKSI MQTT ---
const MQTT_HOST = 'cfc4476f1be24988afb769aef8526aee.s1.eu.hivemq.cloud'; // Cek "Cluster URL" di dashboard
const MQTT_USER = 'matchalatte';    // Username yang anda buat di Access Management
const MQTT_PASS = 'Manuk123_';    // Password yang anda buat
const MQTT_PORT = 8883;

const mqttOptions = {
    username: MQTT_USER,
    password: MQTT_PASS,
    port: MQTT_PORT,
    protocol: 'mqtts', // Penting: Menggunakan 'mqtts' untuk koneksi aman (SSL)
    rejectUnauthorized: true, // Pastikan sertifikat server valid
};

// Hubungkan client
const mqttClient = mqtt.connect(`mqtts://${MQTT_HOST}`, mqttOptions);

mqttClient.on('connect', () => {
    console.log(`[SERVER] BERHASIL Terhubung ke HiveMQ Cloud!`);
    mqttClient.subscribe('sensor/+/+'); 
});

mqttClient.on('error', (err) => {
    console.error(`[SERVER] Error Koneksi MQTT:`, err.message);
});

mqttClient.on('offline', () => {
    console.log(`[SERVER] Koneksi MQTT terputus, mencoba menyambung ulang...`);
});

mqttClient.on('message', async (topic, message) => {
    const nilai = parseFloat(message.toString());
    const parts = topic.split('/'); // sensor/R01/suhu
    
    if (parts.length === 3) {
        const roomCode = parts[1]; // "R01"
        const typeStr = parts[2];  // "suhu"
        
        // A. Kirim Real-time ke Dashboard (Socket.io)
        io.emit('updateSensor', { roomId: roomCode, tipe: typeStr, nilai: nilai });

        // B. Simpan ke Database (PostgreSQL)
        const roomId = ROOM_MAP[roomCode];
        const senseId = SENSE_MAP[typeStr];

        if (roomId && senseId) {
            try {
                await pool.query(
                    'INSERT INTO sensing (sense_id, sense_value, room_id) VALUES ($1, $2, $3)',
                    [senseId, nilai, roomId]
                );
            } catch (err) {
                console.error('❌ DB Insert Error:', err.message);
            }
        }
    }
});

// --- 2. ENDPOINT API HISTORY ---
app.get('/api/history', async (req, res) => {
    const { roomId, senseId, days } = req.query;

    try {
        /**
         * Logika Query Dinamis:
         * Menggunakan trik ($1 = 'all' OR ...) agar filter "Semua" berfungsi
         */
        const queryText = `
            SELECT recorded_at, sense_value, room_id, sense_id
            FROM sensing 
            WHERE ($1 = 'all' OR room_id = $1::int)
            AND ($2 = 'all' OR sense_id = $2::int)
            AND ($3 = 'all' OR recorded_at >= NOW() - ($3 || ' day')::INTERVAL)
            ORDER BY recorded_at DESC
            LIMIT 500;
        `;
        
        const result = await pool.query(queryText, [roomId, senseId, days]);
        res.json(result.rows);
    } catch (err) {
        console.error('❌ DB Select Error:', err.message);
        res.status(500).json({ error: "Gagal mengambil riwayat" });
    }
});

server.listen(3000, () => {
    console.log('🚀 Server berjalan di http://localhost:3000');
});