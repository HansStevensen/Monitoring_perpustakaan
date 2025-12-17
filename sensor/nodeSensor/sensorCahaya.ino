// // Sketch: LDR -> Lux (dengan kalibrasi 2 titik)
// // Pastikan Serial Monitor = 9600 baud

// const int LDR_PIN = A0;
// const float VCC = 5.0;
// const float R_FIXED = 10000.0; // 10k

// // ***** Jika sudah kalibrasi nyata, masukkan A_cal dan B_cal di sini *****
// // Contoh nilai dari perhitungan ilustratif (pakai nilai lux yang AKTUAL untuk akurasi):
// float A_cal = 2.570748449237718e16;  // contoh hasil (ganti setelah kalibrasi nyata)
// float B_cal = 3.3257775896482142;

// void setup() {
//   Serial.begin(9600);
//   delay(100);
//   Serial.println("LDR -> Lux (kalibrasi contoh)");
//   Serial.println("Pastikan Serial Monitor = 9600");
// }

// void loop() {
//   int adc = analogRead(LDR_PIN);
//   float voltage = adc * (VCC / 1023.0);
//   if (voltage <= 0.001) voltage = 0.001;
//   if (voltage >= VCC - 0.001) voltage = VCC - 0.001;
//   float R = R_FIXED * (voltage) / (VCC - voltage);
//   float lux = A_cal * pow(R, -B_cal);

//   Serial.print("ADC: "); Serial.print(adc);
//   Serial.print(" | V: "); Serial.print(voltage, 3);
//   Serial.print(" V | R_LDR: "); Serial.print(R, 1);
//   Serial.print(" ohm | Lux: "); Serial.print(lux, 2);

//   if (lux < 100) {
//     Serial.print(" | Status: TERLALU GELAP");
//   } else if (lux < 300) {
//     Serial.print(" | Status: KURANG TERANG");
//   } else if (lux <= 500) {
//     Serial.print(" | Status: IDEAL (BACA)");
//   } else {
//     Serial.print(" | Status: TERLALU TERANG");
//   }
//   Serial.println();
//   delay(800);
// }