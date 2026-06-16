#ifndef BMP280_SENSOR_H
#define BMP280_SENSOR_H

#include <Adafruit_BMP280.h>
#include <Arduino.h>
#include <PubSubClient.h>
#include <Wire.h>

#include "Sensor.h"

class Bmp280Sensor : public Sensor {
 public:
  Bmp280Sensor(
    uint8_t sdaPin,
    uint8_t sclPin,
    const char* temperatureTopic,
    const char* pressureTopic,
    const char* altitudeTopic,
    float seaLevelPressureHpa
  );

  const char* name() const override;
  bool begin() override;
  void readAndPublish(PubSubClient& mqttClient) override;

 private:
  void publishReading(PubSubClient& mqttClient, const char* topic, float value, uint8_t decimals);

  Adafruit_BMP280 bmp_;
  uint8_t sdaPin_;
  uint8_t sclPin_;
  const char* temperatureTopic_;
  const char* pressureTopic_;
  const char* altitudeTopic_;
  float seaLevelPressureHpa_;
};

#endif
