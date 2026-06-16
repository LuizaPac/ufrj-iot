//import firmata 
const five = require("johnny-five");
const EtherPortClient = require("etherport-client").EtherPortClient;
const board = new five.Board({
  port:new EtherPortClient({
    host: "10.4.44.235",
    port: 3030
  })
});
board.on("ready", function() {
    console.log("READY!");
    console.log(
        board.firmware.name + " " +
        board.firmware.version.major + "." +
        board.firmware.version.minor
    );
    let state = 1;
    let lastVal = 0;
    this.pinMode(16, this.MODES.OUTPUT);
    // Pisca o Led 16
    setInterval(() => {
        this.digitalWrite(16, (state ^= 1));
    }, 500);
    this.analogRead(A0, (value) => {
        if (value !== lastVal)
            console.log(value);
    });
});
