// #include <SoftwareSerial.h>

// SoftwareSerial xbee(10, 11); // RX, TX

// void setup() {
//   Serial.begin(9600); // Ke Laptop (USB)
//   xbee.begin(9600);   // Ke Node Sensor (Zigbee)
// }

// void loop() {
//   // Dari Zigbee -> Ke Laptop
//   if (xbee.available()) {
//     Serial.write(xbee.read());
//   }
  
//   // Dari Laptop -> Ke Zigbee (Opsional, untuk kontrol balik)
//   if (Serial.available()) {
//     xbee.write(Serial.read());
//   }
// }