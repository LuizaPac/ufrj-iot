#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Servo.h>

// WiFi
const char* ssid = <NomeDaRede>;
const char* senha = <Senha>;

// Conexão mqtt
const char* mqtt_server = <IP da máquina>;
const int mqtt_port = <porta>;


WiFiClient espClient;
PubSubClient client(espClient);
//==============================

// Servos

Servo servoBase;
Servo servoOmbro;
Servo servoCotovelo;
Servo servoGarra;

// GPIO do NodeMCU
#define PIN_BASE      D1
#define PIN_COTOVELO  D5
#define PIN_OMBRO     D2
#define PIN_GARRA     D6

//==============================

void conectarWiFi()
{
    Serial.print("Conectando WiFi");

    WiFi.begin(ssid, senha);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println();
    Serial.println("WiFi conectado");
    Serial.println(WiFi.localIP());
}

//==============================

void publicarStatus(String motor,
                    bool ok,
                    String mensagem,
                    int angulo)
{
    String json = "{";

    json += "\"motor\":\"" + motor + "\",";
    json += "\"ok\":";
    json += ok ? "true," : "false,";
    json += "\"mensagem\":\"" + mensagem + "\",";
    json += "\"angulo\":";
    json += String(angulo);

    json += "}";

    client.publish(
        ("braco/" + motor + "/status").c_str(),
        json.c_str(),
        true
    );
}

//==============================

void moverBase(int angulo)
{
    servoBase.write(angulo);
    Serial.println("Base");
}

void moverOmbro(int angulo)
{
    servoOmbro.write(angulo);
    Serial.println("Ombro");
}

void moverCotovelo(int angulo)
{
    servoCotovelo.write(angulo);
    Serial.println("Cotovelo");
}

void moverGarra(int angulo)
{
    servoGarra.write(angulo);
    Serial.println("Garra");
}

//==============================

void callback(char* topic,
              byte* payload,
              unsigned int length)
{
    Serial.println("=== CALLBACK EXECUTADO ===");
    String topico = String(topic);

    String mensagem;

    for (int i = 0; i < length; i++)
        mensagem += (char)payload[i];

    int angulo = mensagem.toInt();

  //  if (angulo < 0 || angulo > 180)
   //     return;

    Serial.println("-----------------------");
    Serial.print("Topico: ");
    Serial.println(topico);

    Serial.print("Angulo: ");
    Serial.println(angulo);

    if (topico == "braco/base/cmd")
    {
        moverBase(angulo);
        publicarStatus("base", true, "comando executado", angulo);
    }

    else if (topico == "braco/ombro/cmd")
    {
        moverOmbro(angulo);
        publicarStatus("ombro", true, "comando executado", angulo);
    }

    else if (topico == "braco/cotovelo/cmd")
    {
        moverCotovelo(angulo);
        publicarStatus("cotovelo", true, "comando executado", angulo);
    }

    else if (topico == "braco/garra/cmd")
    {
        moverGarra(angulo);
        publicarStatus("garra", true, "comando executado", angulo);
    }
}

//==============================

void reconnect()
{
    while (!client.connected())
    {
        Serial.print("Conectando MQTT...");

        if (client.connect("ESP8266_BRACO"))
        {
            Serial.println("OK");

            client.subscribe("braco/base/cmd");
            client.subscribe("braco/ombro/cmd");
            client.subscribe("braco/cotovelo/cmd");
            client.subscribe("braco/garra/cmd");
        }
        else
        {
            Serial.print("Falhou: ");
            Serial.println(client.state());

            delay(3000);
        }
    }
}

//==============================

void setup()
{
    Serial.begin(115200);
    
    pinMode(PIN_BASE, OUTPUT);
    pinMode(PIN_OMBRO, OUTPUT);
    pinMode(PIN_COTOVELO, OUTPUT);
    pinMode(PIN_GARRA, OUTPUT);

    servoBase.attach(PIN_BASE, 500, 2400);
    servoOmbro.attach(PIN_OMBRO, 500, 2400);
    servoCotovelo.attach(PIN_COTOVELO, 500, 2400);
    servoGarra.attach(PIN_GARRA, 500, 2400);

    conectarWiFi();

    client.setServer(mqtt_server, mqtt_port);
    client.setCallback(callback);
}

//==============================

void loop()
{
    if (!client.connected())
        reconnect();

    client.loop();
}

