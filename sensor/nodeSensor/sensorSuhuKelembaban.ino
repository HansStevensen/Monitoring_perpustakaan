// #include <SoftwareSerial.h>
// #include <mqttsn-messages.h> 
// #include <DHT.h> // Pastikan library DHT sudah terinstal di Arduino IDE

// // --- Konfigurasi Sensor DHT11 ---
// #define DHTPIN 52     // Pin Digital D2 tempat data DHT terhubung
// #define DHTTYPE DHT11 // Jenis sensor: DHT11

// // Inisialisasi objek DHT
// DHT dht(DHTPIN, DHTTYPE); 

// // --- Konfigurasi XBee ---
// SoftwareSerial xbee(10, 11); // RX (Pin 10), TX (Pin 11)

// // --- Inisialisasi Library MQTT-SN ---
// MQTTSN mqttsn; 
 
// const char* PUBLISH_TOPIC = "sensor/suhu";
// const char* CLIENT_ID = "Sensor01";

// // ==========================================
// // FUNGSI CALLBACK WAJIB (JANGAN DIHAPUS)
// // ==========================================

// // 1. Wajib: Untuk mengirim data serial ke XBee
// void MQTTSN_serial_send(uint8_t* message_buffer, int length) {
//   xbee.write(message_buffer, length);
// }

// // 2. Wajib: Dipanggil saat ada info Gateway masuk
// void MQTTSN_gwinfo_handler(const msg_gwinfo* msg) {
//   // Biarkan kosong
// }

// // 3. Wajib: Dipanggil saat ada pesan Publish masuk (Subscribe)
// void MQTTSN_publish_handler(const msg_publish* msg) {
//   // Biarkan kosong
// }

// // ==========================================
// // FUNGSI PEMBACAAN DATA SENSOR DHT11
// // ==========================================

// /**
//  * @brief Membaca suhu dari sensor DHT11.
//  * @return Suhu dalam derajat Celcius (integer), atau 0 jika gagal membaca.
//  */
// int getTemperature() {
//   // Membaca kelembaban (bisa diabaikan)
//   float h = dht.readHumidity();
//   // Membaca suhu dalam Celcius (default)
//   float t = dht.readTemperature(); 
    
//     // Cek jika pembacaan gagal
//     if (isnan(t) || isnan(h)) {
//       Serial.println("DHT ERROR: Gagal membaca data Suhu/Kelembaban!");
//       return 0; // Kembalikan 0 jika gagal
//     }
    
//     // Debugging data yang benar sebelum dikirim
//     Serial.print("DHT Reading - Hum: "); Serial.print(h);
//     Serial.print(" % | Temp: "); Serial.print(t); Serial.println(" C");

//   return (int)t; // Kembalikan nilai suhu sebagai integer
// }

// void setup() {
//   Serial.begin(9600);
//   xbee.begin(9600);
//   dht.begin(); // Inisialisasi Sensor DHT
  
//   Serial.println("Node Sensor Started (DHT Mode)");
//   delay(1000);
// }

// void loop() {
//   // --- Menerima Data dari XBee dan memproses paket MQTT-SN ---
//   if (xbee.available() > 0) {
//     uint8_t len = xbee.peek(); 
//     // Periksa apakah semua data paket tersedia sebelum membaca
//     if (xbee.available() >= len) { 
//         uint8_t buffer[66];
//         // Membaca paket lengkap
//         for (int i = 0; i < len; i++) {
//             buffer[i] = xbee.read();
//         }
//         mqttsn.parse_stream(buffer, len);
//     }
//   }

//   // --- Logika Koneksi dan Pendaftaran Topik ---
//   if (!mqttsn.connected()) {
//     Serial.println("Connecting...");
//     mqttsn.connect(0, 60, CLIENT_ID);
//     delay(2000); 
    
//     if (mqttsn.connected()) {
//         Serial.println("Connected! Registering Topic...");
//         mqttsn.register_topic(PUBLISH_TOPIC);
//     } else {
//         Serial.println("Connection failed. Retrying...");
//         delay(2000);
//     }
//   }

//   // --- Logika Publikasi ---
//   static unsigned long lastPub = 0;
//   // Publikasi setiap 5 detik jika terhubung
//   if (millis() - lastPub > 5000 && mqttsn.connected()) { 
    
//     int suhu = getTemperature(); // Ambil suhu dari DHT11
    
//     // Pastikan suhu valid sebelum mengirim (bukan 0 dari error)
//     if (suhu > 0) {
//       char payload[10];
//       itoa(suhu, payload, 10);
      
//       uint8_t index;
//       uint16_t topic_id = mqttsn.find_topic_id(PUBLISH_TOPIC, &index);
      
//       if (topic_id != 0xffff) {
//           Serial.print("Publishing: "); Serial.println(payload);
//           // Publikasi QoS 0
//           mqttsn.publish(0, topic_id, payload, strlen(payload)); 
//       } else {
//           // Jika Topic ID hilang, daftarkan kembali
//           Serial.println("Topic not registered. Re-registering...");
//           mqttsn.register_topic(PUBLISH_TOPIC);
//       }
//     }
    
//     lastPub = millis();
//   }
// }