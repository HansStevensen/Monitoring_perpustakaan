import {SerialPort} from "serialport";
import mqtt from "mqtt";

// --- KONFIGURASI ---
const SERIAL_PORT = 'COM6'; 
const BAUD_RATE = 9600;

// --- SETTING MOSQUITTO LOKAL ---
const MQTT_HOST = 'localhost'; // Gunakan localhost
const MQTT_PORT = 1883;        // Port default tanpa SSL
const MQTT_USER = '';          // Kosongkan jika tidak pakai password
const MQTT_PASS = '';          // Kosongkan jika tidak pakai password

// --- KONSTANTA MQTT-SN ---
const TYPE_CONNECT   = 0x04;
const TYPE_CONNACK   = 0x05;
const TYPE_REGISTER  = 0x0A;
const TYPE_REGACK    = 0x0B;
const TYPE_PUBLISH   = 0x0C;
const TYPE_PINGREQ   = 0x16;
const TYPE_PINGRESP  = 0x17;

// Variable Global
let topicMap = {}; 
let nextTopicId = 1;

// 1. Setup Serial
const port = new SerialPort({ path: SERIAL_PORT, baudRate: BAUD_RATE });
console.log(`[GATEWAY] Membuka Serial di ${SERIAL_PORT}...`);

// 2. Setup MQTT (Updated for Mosquitto)
const mqttOptions = {
    port: MQTT_PORT,
    protocol: 'mqtt', 
};

// Tambahkan user/pass hanya jika diisi
if (MQTT_USER) mqttOptions.username = MQTT_USER;
if (MQTT_PASS) mqttOptions.password = MQTT_PASS;

// Hubungkan client (Perhatikan: mqtt:// bukan mqtts://)
const mqttClient = mqtt.connect(`mqtt://${MQTT_HOST}`, mqttOptions);

mqttClient.on('connect', () => {
    console.log(`[GATEWAY] BERHASIL Terhubung ke Mosquitto Lokal!`);
});

mqttClient.on('error', (err) => {
    console.error(`[GATEWAY] Error Koneksi MQTT:`, err.message);
});

// ... (Sisa kode logika Buffer dan handleMqttSnPacket SAMA PERSIS seperti sebelumnya)
let buffer = Buffer.alloc(0); 
port.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length > 0) {
        const len = buffer[0]; 
        if (len > 0 && buffer.length >= len) {
            const packet = buffer.subarray(0, len);
            buffer = buffer.subarray(len); 
            handleMqttSnPacket(packet);
        } else {
            break;
        }
    }
});

function handleMqttSnPacket(packet) {
    const msgType = packet[1]; 

    if (msgType === TYPE_CONNECT) {
        console.log("[RECV] CONNECT Request");
        const connack = Buffer.from([0x03, TYPE_CONNACK, 0x00]);
        port.write(connack);
        console.log("[SENT] CONNACK");
    }
    else if (msgType === TYPE_REGISTER) {
        const msgId = packet.subarray(4, 6);
        const topicName = packet.subarray(6).toString('utf-8');
        console.log(`[RECV] REGISTER Topik: '${topicName}'`);
        const assignedId = nextTopicId++;
        topicMap[assignedId] = topicName;

        const regack = Buffer.alloc(7);
        regack[0] = 7;
        regack[1] = TYPE_REGACK;
        regack.writeUInt16BE(assignedId, 2);
        regack[4] = msgId[0];
        regack[5] = msgId[1];
        regack[6] = 0x00;
        port.write(regack);
        console.log(`[SENT] REGACK (ID: ${assignedId})`);
    }
    else if (msgType === TYPE_PUBLISH) {
        const topicId = packet.readUInt16BE(3);
        const payload = packet.subarray(7).toString('utf-8');
        const topicName = topicMap[topicId] || `unknown/${topicId}`;

        console.log(`[DATA] ${topicName}: ${payload}`);
        
        // Publish ke Mosquitto Lokal
        mqttClient.publish(topicName, payload);
    }
    else if (msgType === TYPE_PINGREQ) {
        const pingresp = Buffer.from([0x02, TYPE_PINGRESP]);
        port.write(pingresp);
    }
}