console.log("script.js carregado");

const socket = io();

const slider = document.getElementById("slider");
const valor = document.getElementById("valor");

slider.addEventListener("input", () => {

  valor.innerHTML = slider.value + " ms";

  socket.emit("slider", slider.value);

});

slider.oninput = () => {
  alert("movi");
};

socket.on("connect", () => {
  console.log("Socket conectado!");
});

slider.addEventListener("input", () => {

  console.log("Enviando:", slider.value);

  socket.emit("slider", slider.value);

});

function horario() {

  socket.emit("clockwise");

}

function antiHorario() {

  socket.emit("counterclockwise");

}

function pararMotor() {

  socket.emit("stop");

}


console.log(slider);