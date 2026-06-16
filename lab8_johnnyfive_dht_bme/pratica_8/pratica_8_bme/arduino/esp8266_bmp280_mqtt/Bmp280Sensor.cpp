#include "Bmp280Sensor.h"

Bmp280Sensor::Bmp280Sensor(
  uint8_t sdaPin,
  uint8_t sclPin,
  const char* temperatureTopic,
  const char* pressureTopic,
  const char* altitudeTopic,
  float seaLevelPressureHpa
) : sdaPin_(sdaPin),
    sclPin_(sclPin),
    temperatureTopic_(temperatureTopic),
    pressureTopic_(pressureTopic),
    altitudeTopic_(altitudeTopic),
    seaLevelPressureHpa_(seaLevelPressureHpa) {}

const char* Bmp280Sensor::name() const {
  return "BMP280";
}

bool Bmp280Sensor::begin() {
  Wire.begin(sdaPin_, sclPin_);

  if (bmp_.begin(0x76)) {
    Serial.println("BMP280 initialized at address 0x76.");
    return true;
  }

  if (bmp_.begin(0x77)) {
    Serial.println("BMP280 initialized at address 0x77.");
    return true;
  }

  Serial.println("BMP280 not found. Check wiring and I2C address.");
  return false;
}

void Bmp280Sensor::publishReading(PubSubClient& mqttClient, const char* topic, float value, uint8_t decimals) {
  char payload[32];
  dtostrf(value, 0, decimals, payload);
  mqttClient.publish(topic, payload);
}

void Bmp280Sensor::readAndPublish(PubSubClient& mqttClient) {
  const float temperatureC = bmp_.readTemperature();
  const float pressurePa = bmp_.readPressure();
  const float altitudeM = bmp_.readAltitude(seaLevelPressureHpa_);

  if (isnan(temperatureC) || isnan(pressurePa) || isnan(altitudeM)) {
    Serial.println("Invalid BMP280 reading. Skipping publish.");
    return;
  }

  publishReading(mqttClient, temperatureTopic_, temperatureC, 2);
  publishReading(mqttClient, pressureTopic_, pressurePa, 2);
  publishReading(mqttClient, altitudeTopic_, altitudeM, 2);

  Serial.print("BMP280 published temperature: ");
  Serial.print(temperatureC, 2);
  Serial.print(" C, pressure: ");
  Serial.print(pressurePa, 2);
  Serial.print(" Pa, altitude: ");
  Serial.print(altitudeM, 2);
  Serial.println(" m");
}
