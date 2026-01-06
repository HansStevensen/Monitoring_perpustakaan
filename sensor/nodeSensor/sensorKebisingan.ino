// #define SOUND_PIN A0
// #define SAMPLE_COUNT 200   // lebih stabil

// // HASIL KALIBRASI (ruangan sangat sepi)
// float noiseFloor = 0.05;

// void setup() {
//   Serial.begin(9600);
//   pinMode(SOUND_PIN, INPUT);

//   Serial.println("=== Sistem Monitoring Kebisingan Perpustakaan ===");
//   Serial.println("Sensor: SY-M213 | Mode: dB Relatif");
//   Serial.println("------------------------------------------------");
// }

// void loop() {
//   int signalMax = 0;
//   int signalMin = 1023;

//   // Ambil banyak sampel suara
//   for (int i = 0; i < SAMPLE_COUNT; i++) {
//     int sample = analogRead(SOUND_PIN);

//     if (sample > signalMax) signalMax = sample;
//     if (sample < signalMin) signalMin = sample;
//   }

//   // Hitung amplitudo suara
//   float amplitude = signalMax - signalMin;

//   // Proteksi log(0)
//   if (amplitude < 1) amplitude = 1;

//   // Hitung dB relatif
//   float dB = 20.0 * log10(amplitude / noiseFloor);

//   // Batasi nilai minimum
//   if (dB < 0) dB = 0;

//   // Kategori kebisingan perpustakaan
//   String status;
//   if (dB < 30) {
//     status = "Sangat Tenang";
//   } else if (dB < 45) {
//     status = "Tenang (Perpustakaan)";
//   } else if (dB < 60) {
//     status = "Cukup Ramai";
//   } else {
//     status = "Berisik";
//   }

//   // Output ke Serial Monitor
//   Serial.print("Amplitude: ");
//   Serial.print(amplitude);
//   Serial.print(" | Kebisingan: ");
//   Serial.print(dB, 2);
//   Serial.print(" dB");
//   Serial.print(" | Status: ");
//   Serial.println(status);

//   delay(500);
// }