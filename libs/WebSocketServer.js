'use strict';

var WebSocketServer = require('ws');

var wss = null;
var clients = [];
var history = [];

function WSS(port){
  wss = new WebSocketServer.Server({ port: port });
};


//initialize WebSocker Server
WSS.prototype.initWS = () => {
  wss.on('connection', (ws) => {
    console.log('New client connected : ' + ws.upgradeReq.connection.remoteAddress);

    //add new client to clients array
    clients.push(ws);

    sendHistory(ws);
    addOnMesageListener(ws);
    addOnCloseListener(ws);
  });

  wss.on('error', (error) => {
    console.log(error);
  });
};


//function send message to client
function send(client, message) {
  try {
    client.send(message);
  } catch(error) {
    removeFromArray(clients, client);
    console.log(error);
  }
};

//function sends messages to all claients from claients array
function broadcast(message){
  clients.forEach((client) => {
    send(client, message);
  });
};

//fuction sends history to new clients
//stringify history array and send is over WebSocket
function sendHistory(ws){
  console.log('sending history');
  send(ws, JSON.stringify(history));
}

//functaion adds onMessage listener, push new message/draw to history array
//and sends message to all connected clinets
function addOnMesageListener(ws) {
  ws.on('message', (event) => {
    history.push(JSON.parse(event));
    broadcast(event);
    console.log(event);
  });
}

//function adds onClose Listener, and remove client from clients array
function addOnCloseListener(ws) {
  ws.on('close', () => {
    console.log('Client ' + ws.upgradeReq.connection.remoteAddress + ' closed connection.');
    var index = clients.indexOf(ws);
    if (index > -1) {
      clients.splice(index, 1);
    }
  });
}


//helper function to remove elemte from array
function removeFromArray(array, element){
  var index = array.indexOf(element);
  if (index > -1) {
    array.splice(index, 1);
  }
};

module.exports = WSS;
