const path = require("path");
const five = require("johnny-five");
const EtherPortClient = require("etherport-client").EtherPortClient;

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const SENSOR_ADDRESS = 0x76;
const SENSOR_ELEVATION_METERS = 0;
const SENSOR_FREQ_MS = 2000;
const SEA_LEVEL_PRESSURE_PA = 101325;
const DHT_STATUS =
  "DHT11/DHT22 direto no NodeMCU nao e suportado por este servidor via StandardFirmataWiFi. " +
  "Para leituras reais, use firmware customizado no ESP8266 ou um controlador compativel no Johnny-Five.";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

server.listen(3000, () => {
  console.log("Servidor HTML em http://localhost:3000");
});

const board = new five.Board({
  port: new EtherPortClient({
    host: "10.4.44.96",
    port: 3030,
  }),
  repl: false,
});

board.on("ready", () => {
  console.log("NodeMCU conectado via FirmataWiFi");

  const bmp280 = new five.Multi({
    controller: "BMP280",
    address: SENSOR_ADDRESS,
    elevation: SENSOR_ELEVATION_METERS,
    freq: SENSOR_FREQ_MS,
  });

  bmp280.on("change", () => {
    try {
      const temperature = Number(bmp280.thermometer.celsius);
      const pressurePa = Number(bmp280.barometer.pressure) * 1000;
      const altitude =
        44330 * (1 - Math.pow(pressurePa / SEA_LEVEL_PRESSURE_PA, 1 / 5.255));

      if ([temperature, pressurePa, altitude].some(Number.isNaN)) {
        return;
      }

      const payload = {
        temperature: temperature.toFixed(2),
        pressure: pressurePa.toFixed(2),
        altitude: altitude.toFixed(2),
        dhtTemperature: null,
        dhtHumidity: null,
        dhtStatus: DHT_STATUS,
      };

      io.emit("bmp280-data", payload);
      console.log(payload);
    } catch (error) {
      console.error("Erro lendo BMP280:", error.message);
    }
  });
});

board.on("error", (error) => {
  console.error("Erro na conexao com a placa:", error.message);
});
