'use strict';


var WSS = require('./libs/WebSocketServer');


//Listening port for WebSocket
var port = 8081;

//Create WebSocket Server
var wss = new WSS(port);

wss.initWS();
