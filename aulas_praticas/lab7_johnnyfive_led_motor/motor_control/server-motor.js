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

let motor = null;
let currentSpeed = 0;
let currentDirection = null;

function clampSpeed(value) {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return Math.max(0, Math.min(255, parsed));
}

function applyMotorState() {
  if (!motor) {
    return;
  }

  if (currentSpeed === 0 || currentDirection === null) {
    motor.stop();
    return;
  }

  if (currentDirection === "forward") {
    motor.forward(currentSpeed);
    return;
  }

  motor.reverse(currentSpeed);
}

board.on("ready", () => {
  console.log("ESP conectado!");

  motor = new five.Motor({
    pins: {
      pwm: 13,
      dir: 14,
      cdir: 12,
    },
  });
  applyMotorState();
});

board.on("error", (error) => {
  console.error("Erro ao conectar com a placa:", error.message);
});

io.on("connection", (socket) => {
  socket.emit("status", { boardReady: Boolean(motor) });

  socket.on("motorSpeed", (speed) => {
    currentSpeed = clampSpeed(speed);
    applyMotorState();

    console.log("Velocidade:", currentSpeed);
  });

  socket.on("forward", () => {
    currentDirection = "forward";
    applyMotorState();

    console.log("Frente");
  });

  socket.on("reverse", () => {
    currentDirection = "reverse";
    applyMotorState();

    console.log("Ré");
  });

  socket.on("stop", () => {
    currentDirection = null;
    currentSpeed = 0;
    applyMotorState();

    console.log("Parado");
  });
});
