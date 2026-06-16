const five = require("johnny-five");
const EtherPortClient = require("etherport-client").EtherPortClient;

const board = new five.Board({
  port: new EtherPortClient({
    host: "10.4.44.235",
    port: 3030,
  }),
  repl: false,
});

board.on("ready", function () {
  console.log("READY!");

  // LED no pino 16
  const led = new five.Led(16);

  led.blink(50);

  // Leitura analógica no A0
  const sensor = new five.Sensor({
    pin: "A0",
    freq: 250,
  });

  let lastVal = null;

  sensor.on("data", function () {
    if (this.value !== lastVal) {
      console.log(this.value);
      lastVal = this.value;
    }
  });
});
