/* server.js (BACKEND) */
import 'dotenv/config';
import mqtt from "mqtt";
import express from "express";
import http from "node:http";
import {Server} from "socket.io"; // Update cara import socket.io terbaru
import cors from "cors";
import pool from "./db.js";

const app = express();
app.use(cors()); // Bolehin semua orang akses (PENTING BUAT VITE)

const server = http.createServer(app);

// Setup Socket.io dengan izin CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Alamat Frontend Vite kamu
    methods: ["GET", "POST"]
  }
});

const ROOM_MAP = { "R01": 1, "R02": 2};
const SENSE_MAP = { 
  "suhu": 1, 
  "kelembapan": 2, 
  "cahaya": 3, 
  "kebisingan": 4 
};

// --- 1. Koneksi ke MQTT Broker ---
const mqttClient = mqtt.connect('mqtt://localhost:1883'); // Pastikan mosquitto nyala

mqttClient.on('connect', () => {
    console.log("Backend: Terhubung ke MQTT Broker!");
    // Kita subscribe ke topik yang lebih luas biar bisa nangkep semua ruangan
    // Contoh format topik: sensor/R01/suhu atau sensor/R02/kebisingan
    mqttClient.subscribe('sensor/R01/suhu'); 
});

// --- 2. Saat Data Masuk dari Sensor ---
mqttClient.on('message', (topic, message) => {
    const nilai = message.toString();
    console.log(`MQTT Masuk [${topic}]: ${nilai}`);
    
    // Pecah topik misal "sensor/R01/suhu" menjadi bagian-bagian
    // parts[1] = "R01" (Room ID)
    // parts[2] = "suhu" (Tipe Data)
    const parts = topic.split('/');
    
    if (parts.length === 3) {
        const roomId = parts[1]; // R01 atau R02
        const tipe = parts[2];   // suhu, kelembapan, dll
        
        // Kirim ke Frontend via WebSocket
        io.emit('updateSensor', {
            roomId: roomId,
            tipe: tipe,
            nilai: parseFloat(nilai) // Ubah string jadi angka
        });
    }
});

server.listen(3000, () => {
    console.log('Server Backend jalan di port 3000');
});