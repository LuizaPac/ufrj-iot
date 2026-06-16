#include <ESP8266WiFi.h>
#include <PubSubClient.h>

#include "Sensor.h"
#include "Bmp280Sensor.h"

#define SENSOR_BMP280_ENABLED 1

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

const char* MQTT_HOST = "192.168.1.10";
const uint16_t MQTT_PORT = 1883;
const char* MQTT_USERNAME = "";
const char* MQTT_PASSWORD = "";
const char* MQTT_CLIENT_ID = "nodemcu-bmp280";

const unsigned long PUBLISH_INTERVAL_MS = 5000;

const uint8_t I2C_SDA_PIN = D2;
const uint8_t I2C_SCL_PIN = D1;

const char* BMP280_TOPIC_TEMPERATURE = "home/sensors/bmp280/temperature";
const char* BMP280_TOPIC_PRESSURE = "home/sensors/bmp280/pressure";
const char* BMP280_TOPIC_ALTITUDE = "home/sensors/bmp280/altitude";
const float BMP280_SEA_LEVEL_PRESSURE_HPA = 1013.25f;

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

#if SENSOR_BMP280_ENABLED
Bmp280Sensor bmp280Sensor(
  I2C_SDA_PIN,
  I2C_SCL_PIN,
  BMP280_TOPIC_TEMPERATURE,
  BMP280_TOPIC_PRESSURE,
  BMP280_TOPIC_ALTITUDE,
  BMP280_SEA_LEVEL_PRESSURE_HPA
);
#endif

Sensor* sensors[] = {
#if SENSOR_BMP280_ENABLED
  &bmp280Sensor,
#endif
};

const size_t SENSOR_COUNT = sizeof(sensors) / sizeof(sensors[0]);
unsigned long lastPublishAt = 0;

void connectToWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  Serial.print("Connecting to Wi-Fi");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("Wi-Fi connected. IP: ");
  Serial.println(WiFi.localIP());
}

void connectToMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Connecting to MQTT broker...");

    bool connected = false;
    if (strlen(MQTT_USERNAME) == 0) {
      connected = mqttClient.connect(MQTT_CLIENT_ID);
    } else {
      connected = mqttClient.connect(MQTT_CLIENT_ID, MQTT_USERNAME, MQTT_PASSWORD);
    }

    if (connected) {
      Serial.println("connected.");
      return;
    }

    Serial.print("failed, rc=");
    Serial.print(mqttClient.state());
    Serial.println(". Retrying in 5 seconds.");
    delay(5000);
  }
}

void initializeSensors() {
  for (size_t i = 0; i < SENSOR_COUNT; ++i) {
    if (sensors[i]->begin()) {
      continue;
    }

    Serial.print("Failed to initialize sensor: ");
    Serial.println(sensors[i]->name());

    while (true) {
      delay(1000);
    }
  }
}

void publishSensorData() {
  for (size_t i = 0; i < SENSOR_COUNT; ++i) {
    sensors[i]->readAndPublish(mqttClient);
  }
}

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println();
  Serial.println("Starting ESP8266 MQTT sensor publisher");

  connectToWiFi();
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  initializeSensors();
}

void loop() {
  connectToWiFi();

  if (!mqttClient.connected()) {
    connectToMQTT();
  }

  mqttClient.loop();

  const unsigned long now = millis();
  if (now - lastPublishAt >= PUBLISH_INTERVAL_MS) {
    lastPublishAt = now;
    publishSensorData();
  }
}
