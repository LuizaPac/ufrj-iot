const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const five = require("johnny-five");
const EtherPortClient = require("etherport-client").EtherPortClient;

const HOST = "10.4.44.247";
const PORT = 3030;

const SERVER_PORT = 3000;

const SENSOR_ADDRESS = 0x76;
const SENSOR_FREQ_MS = 2000;

const SEA_LEVEL_PRESSURE_HPA = 1013.25;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

server.listen(SERVER_PORT, () => {
  console.log(`Servidor HTML em http://localhost:${SERVER_PORT}`);
});

const board = new five.Board({
  port: new EtherPortClient({
    host: HOST,
    port: PORT,
  }),
  repl: false,
});

board.on("ready", () => {
  console.log("NodeMCU conectado via FirmataWiFi");

  // TEMPERATURA
  const thermometer = new five.Thermometer({
    controller: "BMP280",
    address: SENSOR_ADDRESS,
    freq: SENSOR_FREQ_MS,
  });

  // PRESSAO
  const barometer = new five.Barometer({
    controller: "BMP280",
    address: SENSOR_ADDRESS,
    freq: SENSOR_FREQ_MS,
  });

  console.log("Sensor BMP280/BME280 iniciado");

  setInterval(() => {
    try {
      // Temperatura
      const temperatura = Number(thermometer.celsius);

      // Pressao
      let pressao = Number(barometer.pressure);

      // Alguns firmwares retornam kPa
      // Convertendo para hPa
      if (pressao < 200) {
        pressao = pressao * 10;
      }

      // Altitude
      const altitude =
        44330 * (1 - Math.pow(pressao / SEA_LEVEL_PRESSURE_HPA, 0.1903));

      if ([temperatura, pressao, altitude].some(Number.isNaN)) {
        return;
      }

      const payload = {
        temperatura,
        pressao,
        altitude,
      };

      io.emit("dadosSensor", payload);

      console.clear();
      console.log("=== DADOS BME280 ===");
      console.log(`Temperatura: ${temperatura.toFixed(2)} °C`);
      console.log(`Pressao: ${pressao.toFixed(2)} hPa`);
      console.log(`Altitude: ${altitude.toFixed(2)} m`);
    } catch (error) {
      console.error("Erro lendo sensor:", error.message);
    }
  }, SENSOR_FREQ_MS);
});

board.on("error", (error) => {
  console.error("Erro na conexao com a placa:", error.message);
});