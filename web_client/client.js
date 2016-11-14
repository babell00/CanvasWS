'use strict';

const CANVAS = 'canvas';
const MOUSE_OFFSET = 10;

var canvas = {};

var socket = {
  instance: null,
  url: 'ws://10.40.27.94:8081/',
  send: sendData
};

var drawObject = {
  brush: {
    color: '#'+((1<<24)*Math.random()|0).toString(16),
    size: 5
  },
  position: {
    x: 0,
    y: 0
  }
};

var init = function(){
  if(!('WebSocket' in window)){
    console.log('WebSocket not supported');
  } else {
    connect();
  }
  initCanvas();
}

window.addEventListener("load", init, false);

//WebSocket
function connect(){
  try{
    socket.instance = new WebSocket(socket.url);

    //when connection is established this event will be kicked
    socket.instance.onopen = function(){
      console.log('Connected to ' + socket.url);
      clearCanvas();
    }

    //this function is executed when server send message
    socket.instance.onmessage = function(event){
      if(event){
        var serverData = JSON.parse(event.data);

        //if returned data is type of array, this mean that server sends history data.
        //this need to be rendered in forEach loop
        if(Object.prototype.toString.call(serverData) === '[object Array]' ) {
          serverData.forEach((history) => {
            draw(history);
          });
        } else {
          draw(serverData);
        }
      }
    }

    //kicked when connection is closed
    socket.instance.onclose = function(){
      console.log('Connection closed');

      //If connection is closed function below will try to reconnect.
      connect();
    }

    socket.instance.onerror = function(event){
      console.log(event);
    }
  } catch(exception) {
    console.log(exception);
  }
}

function sendData(data) {
  try {
    if(socket.instance.readyState === 1){
      socket.instance.send(JSON.stringify(data));
    }
  }catch(exception){
    console.log(exception);
  }
}

//Canvas
function initCanvas() {
  canvas.node = document.getElementById(CANVAS);
  canvas.context = canvas.node.getContext('2d');
  canvas.isDrawing = false;
  canvas.node.addEventListener('mousemove', mouseMove);
  canvas.node.addEventListener('mouseup', mouseUp);
  canvas.node.addEventListener('mousedown', mouseDown);
}

function clearCanvas(){
  canvas.context.clearRect(0, 0, canvas.context.width, canvas.context.height);
}

function draw(drawObject){
  canvas.context.fillStyle = drawObject.brush.color;
  canvas.context.beginPath();
  canvas.context.moveTo(drawObject.position.x, drawObject.position.y);
  canvas.context.arc(drawObject.position.x, drawObject.position.y, drawObject.brush.size, 0, Math.PI * 2, false);
  canvas.context.fill();
}

function updateDrawObject(drawObject, mouseEvent) {
  drawObject.position.x = mouseEvent.pageX - MOUSE_OFFSET;
  drawObject.position.y = mouseEvent.pageY - MOUSE_OFFSET;
  return drawObject;
}

function mouseMove(e) {
  if(canvas.isDrawing){
    var _drawObject = updateDrawObject(drawObject, e);
    draw(_drawObject);
    socket.send(_drawObject);
  }
}

function mouseUp(e) {
  canvas.isDrawing = false;
}

function mouseDown(e) {
  canvas.isDrawing = true;
}
