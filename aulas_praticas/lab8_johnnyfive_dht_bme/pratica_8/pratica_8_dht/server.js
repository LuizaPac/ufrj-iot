const path = require("path");
const five = require("johnny-five");
const EtherPortClient = require("etherport-client").EtherPortClient;

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const SENSOR_ADDRESS = 0x76;
const SENSOR_ELEVATION_METERS = 0;
const SENSOR_FREQ_MS = 2000;

const SEA_LEVEL_PRESSURE_HPA = 1013.25;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

server.listen(3000, () => {
  console.log("Servidor HTML em http://localhost:3000");
});

const board = new five.Board({
  port: new EtherPortClient({
    host: "10.4.44.247",
    port: 3030,
  }),
  repl: false,
});

let dhtTemperature = null;
let dhtHumidity = null;

board.on("ready", () => {
  console.log("NodeMCU conectado via FirmataWiFi");

  const bmp280 = new five.Multi({
    controller: "BMP280",
    address: SENSOR_ADDRESS,
    elevation: SENSOR_ELEVATION_METERS,
    freq: SENSOR_FREQ_MS,
  });

  console.log("BMP280 iniciado");

  // =========================
  // BMP280
  // =========================
  bmp280.on("change", () => {
    try {
      const temperature = Number(bmp280.thermometer.celsius);

      let pressure = Number(bmp280.barometer.pressure);

      if (pressure < 200) {
        pressure *= 10;
      }

      const altitude =
        44330 *
        (1 - Math.pow(pressure / SEA_LEVEL_PRESSURE_HPA, 0.1903));

      const payload = {
        temperature: temperature.toFixed(2),
        pressure: pressure.toFixed(2),
        altitude: altitude.toFixed(2),

        dhtTemperature,
        dhtHumidity,
        dhtStatus: "OK (via Firmata string)",
      };

      io.emit("bmp280-data", payload);

      console.clear();
      console.log("=== BMP280 ===");
      console.log(payload);
    } catch (err) {
      console.error("Erro BMP280:", err.message);
    }
  });

 

  board.on("string", (msg) => {
    try {
      // Esperado do NodeMCU:
      // DHT:25.40,60.10

      if (!msg.startsWith("DHT:")) return;

      const data = msg.replace("DHT:", "").split(",");

      dhtTemperature = Number(data[0]).toFixed(2);
      dhtHumidity = Number(data[1]).toFixed(2);

    } catch (err) {
      console.error("Erro parsing DHT:", err.message);
    }
  });
});

board.on("error", (error) => {
  console.error("Erro na conexao com a placa:", error.message);
});