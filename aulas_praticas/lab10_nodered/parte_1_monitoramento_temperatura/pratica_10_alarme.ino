#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <BME280I2C.h>
#include <Wire.h>

// Definições de hardware
#define SDA_PIN D2
#define SCL_PIN D1
#define ALARME_PIN D5

BME280I2C bme;

// Configurações de rede
const char* ssid = "IC-LCI";
const char* password = "aluno.dcc!";
const char* mqtt_server = "10.4.44.14";
const int mqtt_port = 1883;

WiFiClient espClient;
PubSubClient mqttClient(espClient);

// ==================================================
// Funções Auxiliares
// ==================================================

void setup_wifi() {
  Serial.print("Ligando WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void tocarAlarme() {
  tone(ALARME_PIN, 1000); 
  delay(200);
  tone(ALARME_PIN, 1500); 
  delay(200);
  noTone(ALARME_PIN);
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Mensagem recebida no topico: ");
  Serial.println(topic);

  String mensagem = "";
  for (unsigned int i = 0; i < length; i++) {
    mensagem += (char)payload[i];
  }
  
  Serial.print("Conteudo: ");
  Serial.println(mensagem);

  if (String(topic) == "casa/alarme") {
    if (mensagem == "ON") {
      Serial.println("ALARME LIGADO");
      tocarAlarme();
    } else if (mensagem == "OFF") {
      Serial.println("ALARME DESLIGADO");
      noTone(ALARME_PIN);
      digitalWrite(ALARME_PIN, LOW);
    }
  }
}

void reconnect() {
  while (!mqttClient.connected()) {
    Serial.print("Conectando ao MQTT...");
    String id = "NodeMCU-";
    id += ESP.getChipId();
    if (mqttClient.connect(id.c_str())) {
      Serial.println(" conectado!");
      mqttClient.subscribe("casa/alarme");
      mqttClient.publish("casa/status", "NodeMCU online");
    } else {
      Serial.print("Erro: ");
      Serial.println(mqttClient.state());
      delay(5000);
    }
  }
}

void publicarBME280() {
  float temp, hum, pres;
  BME280::TempUnit unidadeTemp(BME280::TempUnit_Celsius);
  BME280::PresUnit unidadePres(BME280::PresUnit_Pa);

  bme.read(pres, temp, hum, unidadeTemp, unidadePres);

  char temperatura[10], umidade[10];
  dtostrf(temp, 5, 2, temperatura);
  dtostrf(hum, 5, 2, umidade);

  mqttClient.publish("casa/temperatura", temperatura);
  mqttClient.publish("casa/umidade", umidade);

  Serial.print("Temp: "); Serial.print(temperatura);
  Serial.print(" | Hum: "); Serial.println(umidade);
}

// ==================================================
// Setup e Loop
// ==================================================

void setup() {
  Serial.begin(115200);
  pinMode(ALARME_PIN, OUTPUT);
  digitalWrite(ALARME_PIN, LOW);

  Wire.begin(SDA_PIN, SCL_PIN);
  while (!bme.begin()) {
    Serial.println("BME280 nao encontrado");
    delay(1000);
  }

  setup_wifi();
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(callback);
}

void loop() {
  if (!mqttClient.connected()) {
    reconnect();
  }
  mqttClient.loop();

  static unsigned long timer = 0;
  if (millis() - timer > 10000) {
    timer = millis();
    publicarBME280();
  }
}