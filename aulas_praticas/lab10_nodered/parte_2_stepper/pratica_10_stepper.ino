#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <AccelStepper.h>

// Configurações de Rede
const char* ssid = "";
const char* password = "";
const char* mqtt_server = "";

// Pinos do Motor
#define IN1 D3
#define IN2 D4
#define IN3 D6
#define IN4 D7
AccelStepper motor(AccelStepper::HALF4WIRE, IN1, IN3, IN2, IN4);

WiFiClient espClient;
PubSubClient client(espClient);

void callback(char* topic, byte* payload, unsigned int length) {
  // Converte o payload recebido para uma String e depois para um inteiro
  String mensagem = "";
  for (int i = 0; i < length; i++) {
    mensagem += (char)payload[i];
  }
  
  int posicaoDesejada = mensagem.toInt();
  
  // Aciona o motor para a posição recebida pelo slider
  motor.moveTo(posicaoDesejada); 
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  
  motor.setMaxSpeed(1000);
  motor.setAcceleration(500);
}

void loop() {
  if (!client.connected()) {
    // Tenta reconectar se cair
    if (client.connect("ESP8266_Motor")) {
      client.subscribe("casa/motor");
    }
  }
  client.loop();
  motor.run();
}
