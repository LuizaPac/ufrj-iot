const five = require("johnny-five");
const { EtherPortClient } = require("etherport-client");

const board = new five.Board({
  port: new EtherPortClient({
    host: "10.4.44.235",
    port: 3030,
  }),
  repl: false,
});

board.on("ready", () => {
  console.log("ESP conectado. Aplicando velocidade maxima para frente.");

  const motor = new five.Motor({
    pins: {
      pwm: 13,
      dir: 14,
      cdir: 12,
    },
  });

  motor.forward(255);
});

board.on("error", (error) => {
  console.error("Erro ao conectar com a placa:", error.message);
});
