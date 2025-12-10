const { SerialPort } = require('serialport');
const mqtt = require('mqtt');

// --- KONFIGURASI ---
const SERIAL_PORT = 'COM6'; // Ganti dengan PORT Arduino Base Station Anda
const BAUD_RATE = 9600;
const MQTT_BROKER = 'mqtt://localhost:1883'; // Alamat Mosquitto

// --- KONSTANTA MQTT-SN (Sesuai Library Boriz) ---
const TYPE_CONNECT   = 0x04;
const TYPE_CONNACK   = 0x05;
const TYPE_REGISTER  = 0x0A;
const TYPE_REGACK    = 0x0B;
const TYPE_PUBLISH   = 0x0C;
const TYPE_PINGREQ   = 0x16;
const TYPE_PINGRESP  = 0x17;

// Variable Global
let topicMap = {}; // Menyimpan { TopicID: "NamaTopik" }
let nextTopicId = 1;

// 1. Setup Serial (Ke Arduino)
const port = new SerialPort({ path: SERIAL_PORT, baudRate: BAUD_RATE });
console.log(`[GATEWAY] Membuka Serial di ${SERIAL_PORT}...`);

// 2. Setup MQTT (Ke Mosquitto)
const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on('connect', () => {
    console.log(`[GATEWAY] Terhubung ke Broker MQTT (${MQTT_BROKER})`);
});

// 3. Logika Utama: Membaca Data Serial
let buffer = Buffer.alloc(0); // Buffer penampung data pecahan

port.on('data', (chunk) => {
    // Gabungkan data baru ke buffer
    buffer = Buffer.concat([buffer, chunk]);

    // Proses paket selama buffer cukup panjang
    while (buffer.length > 0) {
        const len = buffer[0]; // Byte pertama adalah Panjang Paket

        // Validasi: Jika panjang paket valid (tidak 0) dan data sudah lengkap
        if (len > 0 && buffer.length >= len) {
            // Potong paket dari buffer
            const packet = buffer.subarray(0, len);
            buffer = buffer.subarray(len); // Sisanya disimpan untuk loop berikutnya

            handleMqttSnPacket(packet);
        } else {
            // Data belum lengkap, tunggu chunk berikutnya
            break;
        }
    }
});

// Fungsi untuk menangani Paket MQTT-SN
function handleMqttSnPacket(packet) {
    const msgType = packet[1]; // Byte kedua adalah Tipe Pesan

    // --- KASUS 1: Arduino minta CONNECT ---
    if (msgType === TYPE_CONNECT) {
        console.log("[RECV] CONNECT Request");
        // Balas CONNACK: [Len=3, Type=0x05, ReturnCode=0x00]
        const connack = Buffer.from([0x03, TYPE_CONNACK, 0x00]);
        port.write(connack);
        console.log("[SENT] CONNACK");
    }

    // --- KASUS 2: Arduino minta REGISTER Topik ---
    else if (msgType === TYPE_REGISTER) {
        // Struktur: [Len, Type, TopicId(2), MsgId(2), TopicName...]
        const msgId = packet.subarray(4, 6);
        const topicName = packet.subarray(6).toString('utf-8');

        console.log(`[RECV] REGISTER Topik: '${topicName}'`);

        // Assign ID baru
        const assignedId = nextTopicId++;
        topicMap[assignedId] = topicName;

        // Balas REGACK: [Len=7, Type=0x0B, TopicId_H, TopicId_L, MsgId_H, MsgId_L, RetCode]
        const regack = Buffer.alloc(7);
        regack[0] = 7;
        regack[1] = TYPE_REGACK;
        regack.writeUInt16BE(assignedId, 2); // Tulis Topic ID (2 byte)
        regack[4] = msgId[0];                // Copy Msg ID
        regack[5] = msgId[1];
        regack[6] = 0x00;                    // Return Code OK

        port.write(regack);
        console.log(`[SENT] REGACK (ID: ${assignedId})`);
    }

    // --- KASUS 3: Arduino PUBLISH Data ---
    else if (msgType === TYPE_PUBLISH) {
        // Struktur: [Len, Type, Flags, TopicId(2), MsgId(2), Data...]
        const topicId = packet.readUInt16BE(3);
        const payload = packet.subarray(7).toString('utf-8');

        // Cari nama topik asli
        const topicName = topicMap[topicId] || `unknown/${topicId}`;

        console.log(`[DATA] ${topicName}: ${payload}`);

        // Kirim ke Mosquitto (Broker Internet)
        mqttClient.publish(topicName, payload);
    }
    
    // --- KASUS 4: PINGREQ (Keep Alive) ---
    else if (msgType === TYPE_PINGREQ) {
        // Balas PINGRESP agar Arduino tidak timeout
        const pingresp = Buffer.from([0x02, TYPE_PINGRESP]);
        port.write(pingresp);
    }
}