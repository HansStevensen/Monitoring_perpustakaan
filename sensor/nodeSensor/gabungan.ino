// #include <SoftwareSerial.h>
// #include <mqttsn-messages.h> 
// #include <DHT.h> 

// // ==========================================
// // KONFIGURASI PIN & SENSOR
// // ==========================================

// // 1. SENSOR SUHU & KELEMBAPAN (DHT11)
// #define DHTPIN 52       // Pin Digital
// #define DHTTYPE DHT11
// DHT dht(DHTPIN, DHTTYPE);

// // 2. SENSOR SUARA (Mic)
// #define SOUND_PIN A0    // Pin Analog
// #define SAMPLE_COUNT 200 
// float noiseFloor = 0.05; // Kalibrasi level senyap

// // 3. SENSOR CAHAYA (LDR)
// #define LDR_PIN A1      // Pin Analog (DIPINDAH KE A1 AGAR TIDAK BENTROK)
// const float VCC = 5.0;
// const float R_FIXED = 10000.0; // 10k Ohm
// // Konstanta Kalibrasi Lux (Sesuaikan jika perlu)
// float A_cal = 2.570748449237718e16; 
// float B_cal = 3.3257775896482142;

// // 4. KOMUNIKASI XBEE (Zigbee)
// SoftwareSerial xbee(10, 11); // RX, TX

// // ==========================================
// // KONFIGURASI MQTT-SN
// // ==========================================
// MQTTSN mqttsn; 
// const char* CLIENT_ID = "SensorGabungan"; // ID Unik Node ini

// // Daftar Topik (Sesuai dengan Backend Node.js)
// const char* TOPIC_SUHU       = "sensor/R01/suhu";
// const char* TOPIC_KELEMBAPAN = "sensor/R01/kelembapan";
// const char* TOPIC_CAHAYA     = "sensor/R01/cahaya";
// const char* TOPIC_KEBISINGAN = "sensor/R01/kebisingan";

// // ==========================================
// // FUNGSI UTILITAS SENSOR
// // ==========================================

// // Baca Suhu (Celcius)
// int getTemperature() {
//   float t = dht.readTemperature();
//   if (isnan(t)) return 0;
//   return (int)t;
// }

// // Baca Kelembapan (%)
// int getHumidity() {
//   float h = dht.readHumidity();
//   if (isnan(h)) return 0;
//   return (int)h;
// }

// // Baca Cahaya (Lux)
// int getLux() {
//   int adc = analogRead(LDR_PIN);
//   float voltage = adc * (VCC / 1023.0);
  
//   if (voltage <= 0.001) voltage = 0.001;
//   if (voltage >= VCC - 0.001) voltage = VCC - 0.001;
  
//   float R = R_FIXED * (voltage) / (VCC - voltage);
//   float lux = A_cal * pow(R, -B_cal);
  
//   return (int)lux; // Kirim sebagai integer agar hemat data
// }

// // Baca Kebisingan (dB)
// float getNoise() {
//   int signalMax = 0;
//   int signalMin = 1023;

//   // Sampling suara sesaat
//   for (int i = 0; i < SAMPLE_COUNT; i++) {
//     int sample = analogRead(SOUND_PIN);
//     if (sample > signalMax) signalMax = sample;
//     if (sample < signalMin) signalMin = sample;
//   }

//   float amplitude = signalMax - signalMin;
//   if (amplitude < 1) amplitude = 1;

//   float dB = 20.0 * log10(amplitude / noiseFloor);
//   if (dB < 0) dB = 0;
  
//   return dB;
// }

// // ==========================================
// // CALLBACK MQTT-SN (WAJIB)
// // ==========================================
// void MQTTSN_serial_send(uint8_t* message_buffer, int length) {
//   xbee.write(message_buffer, length);
// }
// void MQTTSN_gwinfo_handler(const msg_gwinfo* msg) {}
// void MQTTSN_publish_handler(const msg_publish* msg) {}

// // ==========================================
// // MAIN PROGRAM
// // ==========================================

// void setup() {
//   Serial.begin(9600);
//   xbee.begin(9600);
  
//   dht.begin();
//   pinMode(SOUND_PIN, INPUT);
//   // LDR_PIN otomatis INPUT pada Analog

//   Serial.println("=== NODE SENSOR GABUNGAN STARTED ===");
//   Serial.println("Suhu/Hum (DHT) | Suara (A0) | Cahaya (A1)");
//   delay(1000);
// }

// void loop() {
//   // 1. Cek Pesan Masuk dari Gateway
//   if (xbee.available() > 0) {
//     uint8_t len = xbee.peek();
//     if (xbee.available() >= len) {
//       uint8_t buffer[66];
//       for (int i = 0; i < len; i++) buffer[i] = xbee.read();
//       mqttsn.parse_stream(buffer, len);
//     }
//   }

//   // 2. Cek Koneksi & Registrasi Ulang
//   if (!mqttsn.connected()) {
//     Serial.println("Connecting to Gateway...");
//     mqttsn.connect(0, 60, CLIENT_ID);
//     delay(2000);

//     if (mqttsn.connected()) {
//       Serial.println("Connected! Registering Topics...");
//       mqttsn.register_topic(TOPIC_SUHU);      delay(200);
//       mqttsn.register_topic(TOPIC_KELEMBAPAN); delay(200);
//       mqttsn.register_topic(TOPIC_CAHAYA);     delay(200);
//       mqttsn.register_topic(TOPIC_KEBISINGAN); delay(200);
//     } else {
//       Serial.println("Connection failed. Retrying...");
//       delay(2000);
//     }
//   }

//   // 3. Publikasi Data (Interval 5 detik)
//   static unsigned long lastPub = 0;
//   if (millis() - lastPub > 5000 && mqttsn.connected()) {
    
//     // Ambil Data Sensor
//     int val_suhu = getTemperature();
//     int val_hum  = getHumidity();
//     int val_lux  = getLux();
//     float val_db = getNoise();

//     // Helper function untuk publish
//     publishData(TOPIC_SUHU, String(val_suhu).c_str());
//     publishData(TOPIC_KELEMBAPAN, String(val_hum).c_str());
//     publishData(TOPIC_CAHAYA, String(val_lux).c_str());
//     publishData(TOPIC_KEBISINGAN, String(val_db, 1).c_str()); // 1 desimal

//     Serial.println("--- Data Published ---");
//     lastPub = millis();
//   }
// }

// // Fungsi Bantuan untuk Publish agar kode loop lebih bersih
// void publishData(const char* topic_name, const char* payload) {
//   uint8_t index;
//   uint16_t topic_id = mqttsn.find_topic_id(topic_name, &index);

//   if (topic_id != 0xffff) {
//     Serial.print("Pub "); Serial.print(topic_name); Serial.print(": "); Serial.println(payload);
//     mqttsn.publish(0, topic_id, payload, strlen(payload));
//   } else {
//     Serial.print("Topic Missing: "); Serial.println(topic_name);
//     mqttsn.register_topic(topic_name);
//   }
// }