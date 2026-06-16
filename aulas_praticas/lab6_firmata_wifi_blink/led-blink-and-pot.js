const five = require("johnny-five");
const EtherPortClient = require("etherport-client").EtherPortClient;

const pin_pot = "A0";
const pin_led = 16;

const board = new five.Board({
  port: new EtherPortClient({
    host: "10.4.44.235",
    port: 3030,
  }),
  repl: false,
});

board.on("ready", function () {
  console.log("READY!");

  const led = new five.Led(pin_led);

  let currentInterval = 500;
  led.blink(currentInterval);

  const potentiometer = new five.Sensor({
    pin: pin_pot,
    freq: 250,
  });

  potentiometer.on("data", function () {
    const potValue = this.value;

    // Map A0 value from 0-1023 to blink interval from 50-1000 ms
    const newInterval = five.Fn.map(potValue, 0, 1023, 50, 1000);

    // Avoid restarting blink for very small changes
    if (Math.abs(newInterval - currentInterval) > 20) {
      currentInterval = newInterval;

      led.stop();
      led.blink(currentInterval);

      console.log(
        "Pot:",
        potValue,
        "| Blink interval:",
        Math.round(currentInterval),
        "ms"
      );
    }
  });
});
