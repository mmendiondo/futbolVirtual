var express = require('express');
var app = express();


var game = require('./resolve');

var http = require('http').Server(app);
var io = require('socket.io')(http);

var instance = require('./instance');

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.use(express.static(__dirname + '/public'));

//["Dar Pase", "Patear al Arco", "Gambetear", "Atajar"];

var clients = [];
var instancia = new instance();

io.on('connection', function(socket){

	socket.on('disconnect', function() {
		game.playerDisconnected(instancia, socket);
	});

	socket.on('chat message', function(msg){
		io.emit('chat message', msg);
	});

	socket.on('connect game', function(msg){
		var obj = game.playerConnected(instancia, socket, msg);

		for(var i in obj.informSockets){
			obj.informSockets[i].emit('game connected', JSON.stringify(obj.currentPlayer));
		}
	});

	socket.on('game action', function(msg){
		var obj = game.resolveGameAction(instancia, socket, msg);

		for(var i in obj.informSockets){
			obj.informSockets[i].emit('game available actions', JSON.stringify(obj.actions));
		}
	});

});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening *:');
});
