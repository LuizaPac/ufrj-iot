const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const five = require("johnny-five");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

// Arduino
const board = new five.Board({
    port: "/dev/ttyACM0"
});

board.on("error", (error) => {
    console.error("Erro ao conectar com a placa:");
    console.error(error.message || error);
});

board.on("ready", () => {

    console.log("Arduino conectado!");
    console.log("isReady", board.isReady);
    console.log("io name", board.io.name);
    console.log("firmware", board.io.firmware);
    console.log("accelStepperConfig", board.io.accelStepperConfig);
    console.log(board.pins);

    // motor 28BYJ-48 + ULN2003
    const stepper = new five.Stepper({
        type: five.Stepper.TYPE.FOUR_WIRE,
        stepsPerRev: 2048,
        pins: [8, 10, 9, 11]
    });

    io.on("connection", (socket) => {

        console.log("Usuário conectado!");

        socket.on("motor", (valor) => {

            console.log("Valor:", valor);

            const passos = parseInt(valor);

            stepper
                .rpm(10)
                .cw()
                .step(passos, () => {

                    console.log("Motor movimentado");

                });
        });
    });
});

server.listen(3000, () => {

    console.log("Servidor rodando!");
    console.log("http://localhost:3000");
});
