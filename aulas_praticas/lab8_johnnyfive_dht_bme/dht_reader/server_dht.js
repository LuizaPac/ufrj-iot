const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const five = require("johnny-five");
const EtherPortClient = require("etherport-client").EtherPortClient;

const HOST = "10.4.44.96";
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

  const bmp280 = new five.Multi({
    controller: "BMP280",
    address: SENSOR_ADDRESS,
    freq: SENSOR_FREQ_MS,
  });

  console.warn(
    "DHT22 em GPIO14/D5 nao esta disponivel via StandardFirmataWiFi neste codigo. " +
      "O payload segue apenas com BMP280; para DHT22 remoto voce precisa de firmware customizado no ESP8266."
  );

  bmp280.on("change", () => {
    try {
      const temperaturaBMP = Number(bmp280.thermometer.celsius);
      const pressao = Number(bmp280.barometer.pressure);
      const altitude =
        44330 * (1 - Math.pow(pressao / SEA_LEVEL_PRESSURE_HPA, 1 / 5.255));

      if ([temperaturaBMP, pressao, altitude].some(Number.isNaN)) {
        return;
      }

      const payload = {
        temperaturaBMP,
        pressao,
        altitude,
        temperaturaDHT: null,
        umidade: null,
        dhtStatus:
          "DHT22 em D5/GPIO14 nao e suportado por StandardFirmataWiFi; precisa de firmware customizado no ESP8266.",
      };

      io.emit("dadosSensor", payload);
      console.log(payload);
    } catch (error) {
      console.error("Erro lendo sensores:", error.message);
    }
  });
});

board.on("error", (error) => {
  console.error("Erro na conexao com a placa:", error.message);
});
