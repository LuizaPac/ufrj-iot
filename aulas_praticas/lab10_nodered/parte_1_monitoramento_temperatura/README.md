Claro, Ana. Cola isso no `vim` como `README.md`:

````markdown
# Projeto Node-RED

Este repositório contém um arquivo `flows.json` para ser aberto no Node-RED.

## 1. Instalar Node.js e npm

No Ubuntu/Linux, abra o terminal e rode:

```bash
sudo apt update
sudo apt install nodejs npm
````

Confira se a instalação funcionou:

```bash
node -v
npm -v
```

## 2. Instalar o Node-RED

Instale o Node-RED globalmente:

```bash
sudo npm install -g --unsafe-perm node-red
```

## 3. Rodar o Node-RED

No terminal, execute:

```bash
node-red
```

Deixe esse terminal aberto enquanto estiver usando o Node-RED.

Depois, abra no navegador:

```text
http://localhost:1880
```

## 4. Importar o `flows.json`

No editor do Node-RED:

1. Clique no menu no canto superior direito.
2. Vá em `Import`.
3. Selecione o arquivo flows.json
7. Clique em `Import`.

## 5. Instalar os nós usados pelo fluxo

Se aparecerem nós como `unknown`, é porque alguns pacotes ainda não foram instalados.

Para este fluxo, instale:

```text
node-red-contrib-telegrambot
node-red-contrib-aedes
@flowfuse/node-red-dashboard
```

### Opção A: instalar pela interface do Node-RED

No editor do Node-RED:

1. Clique no menu no canto superior direito.
2. Vá em `Manage palette`.
3. Entre na aba `Install`.
4. Pesquise e instale os pacotes:

```text
node-red-contrib-telegrambot
node-red-contrib-aedes
@flowfuse/node-red-dashboard
```

Depois de instalar, recarregue a página e clique em `Deploy`.

### Opção B: instalar pelo terminal

Também é possível instalar os pacotes diretamente na pasta de usuário do Node-RED:

```bash
cd ~/.node-red
npm install node-red-contrib-telegrambot node-red-contrib-aedes @flowfuse/node-red-dashboard
```

Depois, reinicie o Node-RED:

```bash
Ctrl + C
node-red
```

## 6. Acessar o dashboard

Caso o dashboard esteja configurado, ele pode ser acessado em:

```text
http://localhost:1880/dashboard
```

