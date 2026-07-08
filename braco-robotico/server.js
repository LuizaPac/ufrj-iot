const mqtt = require("mqtt");

const BROKER = "mqtt://localhost:1883";

const client = mqtt.connect(BROKER, {
    clientId: "controlador-braco-" + Math.random().toString(16).substring(2),
    reconnectPeriod: 2000
});


// Lista dos motores permitidos
const motores = [
    "base",
    "ombro",
    "cotovelo",
    "garra"
];


client.on("connect", () => {

    console.log("================================");
    console.log("Controlador do braço conectado");
    console.log("================================");


    // Assina somente os motores definidos
    motores.forEach((motor) => {

        const topico = `braco/${motor}/cmd`;

        client.subscribe(topico, (erro) => {

            if (erro) {
                console.error(
                    "Erro assinando:",
                    topico
                );
            } else {
                console.log(
                    "Escutando:",
                    topico
                );
            }

        });

    });

});


// Recebe comandos
client.on("message", (topic, message) => {


    const partes = topic.split("/");

    const motor = partes[1];

    const angulo = Number(message.toString());


    if (isNaN(angulo)) {

        console.log(
            `Valor inválido para ${motor}:`,
            message.toString()
        );

        publicarStatus(
            motor,
            false,
            "angulo invalido"
        );

        return;
    }


    console.log("--------------------------------");
    console.log("Motor :", motor);
    console.log("Ângulo:", angulo);


    // ===========================
    // Processamento individual
    // ===========================

    switch(motor) {

        case "base":
            moverBase(angulo);
            break;


        case "ombro":
            moverOmbro(angulo);
            break;


        case "cotovelo":
            moverCotovelo(angulo);
            break;


        case "garra":
            moverGarra(angulo);
            break;

    }


    publicarStatus(
        motor,
        true,
        "comando executado",
        angulo
    );


});



// ===============================
// Funções dos motores
// ===============================

function moverBase(angulo) {

    console.log(
        "Movendo BASE para",
        angulo
    );

    // Futuro:
    // enviar PWM / CAN / serial
}


function moverOmbro(angulo) {

    console.log(
        "Movendo OMBRO para",
        angulo
    );

}


function moverCotovelo(angulo) {

    console.log(
        "Movendo COTOVELO para",
        angulo
    );

}


function moverGarra(angulo) {

    console.log(
        "Movendo GARRA para",
        angulo
    );

}



// Publica retorno MQTT
function publicarStatus(
    motor,
    ok,
    mensagem,
    angulo = null
) {


    const status = {

        motor: motor,
        ok: ok,
        mensagem: mensagem,
        angulo: angulo,
        timestamp: new Date().toISOString()

    };


    client.publish(
        `braco/${motor}/status`,
        JSON.stringify(status),
        { qos: 1 }
    );

}



// Tratamento de erros

client.on("error", (erro) => {

    console.error(
        "MQTT erro:",
        erro.message
    );

});


client.on("reconnect", () => {

    console.log(
        "Reconectando ao broker..."
    );

});
