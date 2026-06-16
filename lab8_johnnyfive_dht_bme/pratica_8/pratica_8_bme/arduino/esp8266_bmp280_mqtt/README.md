# ESP8266 MQTT Sensors

This Arduino sketch uses an `ESP8266 NodeMCU` to read sensors and publish their values to an MQTT broker so they can be consumed in Node-RED.

## Architecture

```text
ESP8266 NodeMCU + sensors -> MQTT broker -> Node-RED
```

The current implementation includes one enabled sensor, `BMP280`, and publishes three separate MQTT messages:

- `home/sensors/bmp280/temperature`
- `home/sensors/bmp280/pressure`
- `home/sensors/bmp280/altitude`

## Required Libraries

Install these libraries in the Arduino IDE:

- `ESP8266` board package
- `PubSubClient`
- `Adafruit BMP280 Library`
- `Adafruit Unified Sensor`

## Project Structure

This sketch is split into a main file plus sensor classes:

- [esp8266_bmp280_mqtt.ino](/home/luizapacheco/Documents/ufrj/ufrj-iot/pratica_8/pratica_8_bme/arduino/esp8266_bmp280_mqtt/esp8266_bmp280_mqtt.ino)
- [Sensor.h](/home/luizapacheco/Documents/ufrj/ufrj-iot/pratica_8/pratica_8_bme/arduino/esp8266_bmp280_mqtt/Sensor.h)
- [Bmp280Sensor.h](/home/luizapacheco/Documents/ufrj/ufrj-iot/pratica_8/pratica_8_bme/arduino/esp8266_bmp280_mqtt/Bmp280Sensor.h)
- [Bmp280Sensor.cpp](/home/luizapacheco/Documents/ufrj/ufrj-iot/pratica_8/pratica_8_bme/arduino/esp8266_bmp280_mqtt/Bmp280Sensor.cpp)

The `.ino` works as the main entrypoint:

- Wi-Fi and MQTT configuration
- sensor enable/disable `#define`s
- sensor object registration
- main `setup()` and `loop()`

Each sensor class is responsible for:

- `begin()` to initialize its pins/bus/device
- `readAndPublish()` to read the device and publish MQTT messages
- `name()` for logging

## Hardware Notes

- Target board: `NodeMCU 1.0 (ESP-12E Module)`
- Sensor: `BMP280`
- I2C addresses supported by the sketch: `0x76` and `0x77`
- Default `Wire.begin()` is used for ESP8266 I2C pins

Typical NodeMCU I2C wiring:

- `3V3` -> `VCC`
- `GND` -> `GND`
- `D1` -> `SCL`
- `D2` -> `SDA`

## Configuration

Open [esp8266_bmp280_mqtt.ino](/home/luizapacheco/Documents/ufrj/ufrj-iot/pratica_8/pratica_8_bme/arduino/esp8266_bmp280_mqtt/esp8266_bmp280_mqtt.ino) and edit these constants:

```cpp
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

const char* MQTT_HOST = "192.168.1.10";
const uint16_t MQTT_PORT = 1883;
const char* MQTT_USERNAME = "";
const char* MQTT_PASSWORD = "";
```

Also adjust these if needed:

- `MQTT_CLIENT_ID`
- `PUBLISH_INTERVAL_MS`
- `I2C_SDA_PIN`
- `I2C_SCL_PIN`

### Enabling Sensors

Sensors are controlled in the main file with `#define`s:

```cpp
#define SENSOR_BMP280_ENABLED 1
```

When you add a new sensor later, the intended pattern is:

```cpp
#define SENSOR_BMP280_ENABLED 1
#define SENSOR_DHT22_ENABLED 1
```

Then add the new sensor class and register it in the `sensors[]` array.

## Upload

1. Open the `.ino` in Arduino IDE.
2. Select `NodeMCU 1.0 (ESP-12E Module)`.
3. Select the correct serial port.
4. Upload the sketch.
5. Open Serial Monitor at `115200` baud.

Expected Serial output includes:

- Wi-Fi connection status
- MQTT connection status
- sensor initialization status
- Published readings

## Node-RED

In Node-RED, add an `mqtt in` node and subscribe to:

```text
home/sensors/bmp280/#
```

Then connect it to a `debug` node to inspect incoming messages.

You can also create three separate `mqtt in` nodes if you want one per topic.

## Payload Format

Each topic publishes a plain numeric string payload, for example:

- topic: `home/sensors/bmp280/temperature`
  payload: `26.45`
- topic: `home/sensors/bmp280/pressure`
  payload: `100923.52`
- topic: `home/sensors/bmp280/altitude`
  payload: `33.10`

## Notes

- This sketch is publish-only. It does not subscribe to command topics.
- It is independent from the existing `server-bme.js` Socket.IO flow in this project.
- If an enabled sensor is not detected, the board will stay halted after boot and print an error on Serial.
