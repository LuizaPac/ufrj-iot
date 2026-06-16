const five = require("johnny-five");
const EtherPortClient = require("etherport-client").EtherPortClient;

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

server.listen(3000, () => {
  console.log("Servidor web iniciado em http://localhost:3000");
});

const board = new five.Board({
  port: new EtherPortClient({
    host: "10.4.44.235",
    port: 3030,
  }),
  repl: false,
});

board.on("ready", () => {
  console.log("ESP conectado!");

  const led = new five.Led(16);

  let currentDelay = 500;

  led.blink(currentDelay);

  io.on("connection", (socket) => {
    console.log("Cliente web conectado");

    socket.on("blinkSpeed", (value) => {
      currentDelay = parseInt(value);

      led.stop();
      led.blink(currentDelay);

      console.log("Nova velocidade:", currentDelay);
    });
  });
});
