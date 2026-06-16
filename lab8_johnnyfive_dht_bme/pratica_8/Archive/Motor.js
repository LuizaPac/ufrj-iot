const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Board, Pin } = require("johnny-five");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const board = new Board({
  port: "/dev/ttyACM0",
  repl: false
});

board.on("ready", () => {

  console.log("Arduino conectado!");

  const IN1 = new Pin(8);
  const IN2 = new Pin(9);
  const IN3 = new Pin(10);
  const IN4 = new Pin(11);

  

  const sequence = [
    [1,0,0,0],
    [1,1,0,0],
    [0,1,0,0],
    [0,1,1,0],
    [0,0,1,0],
    [0,0,1,1],
    [0,0,0,1],
    [1,0,0,1]
  ];

  let currentStep = 0;
  let direction = 1;
  let motorInterval = null;

  function applyStep(stepData) {

    IN1.write(stepData[0]);
    IN2.write(stepData[1]);
    IN3.write(stepData[2]);
    IN4.write(stepData[3]);
  }

  function stopMotor() {

    if (motorInterval) {
      clearInterval(motorInterval);
      motorInterval = null;
    }

    IN1.low();
    IN2.low();
    IN3.low();
    IN4.low();

    console.log("Motor parado");
  }

  function startMotor(delay) {

    if (motorInterval) {
      clearInterval(motorInterval);
    }

    motorInterval = setInterval(() => {

      applyStep(sequence[currentStep]);

      currentStep += direction;

      if (currentStep >= sequence.length) {
        currentStep = 0;
      }

      if (currentStep < 0) {
        currentStep = sequence.length - 1;
      }

    }, delay);
  }

  io.on("connection", socket => {

    console.log("Cliente conectado");

    socket.on("slider", value => {

      const delay = parseInt(value);

      console.log(`Delay: ${delay} ms`);

      startMotor(delay);
    });

    socket.on("clockwise", () => {

      direction = 1;

      console.log("Sentido horário");
    });

    socket.on("counterclockwise", () => {

      direction = -1;

      console.log("Sentido anti-horário");
    });

    socket.on("stop", () => {

      stopMotor();
    });

    socket.on("disconnect", () => {

      console.log("Cliente desconectado");
    });

  });

});

board.on("error", err => {

  console.error(err);

});

server.listen(3000, () => {

  console.log("Servidor rodando:");
  console.log("http://localhost:3000");

});