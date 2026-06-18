# Instruções de trabalho

- Objetivo: Controle de articulações de braço robótico via servidor javascript
- Bibliotecas usadas:

## Tarefas:
- Criar código mockado do ESP 
  - Objetivo: Validação do controle de servos motores
  - Criar classe de Motor (preceber nome)
  - Criar classe MqttConnection mockada (eventualmente vai receber dados mqtt para conetrolar os motores, mas momentaneamente pode ser definido de forma estática, sem precisar criar a conexão. Mas já criaremos o esqueleto para isso)
- Criar conexão MQTT
  - Substituir a classe mockada do ESP
  - Criar broker MQTT no computador (identificar o IO e inserir no código do ESP)
  - Talvez seja necessário já inciar o NodeRed (deixar simples tanto as entradas como as saídas)
- Criar conexão persistente
  - IP fixo/statico ou varredura na rede
  - Referência: TCC de controle de ar condicionado
