var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
	socket.on('chat message', function(msg){
		io.emit('chat message', msg);
	});

	socket.on('game connected', function(msg){
		//agregar usuario by id
	    
	  });

	socket.on('game action', function(msg){

		//calculate stuff and emit to current player now to take actions
	    io.emit('game available actions', "actions as json");
	  });

});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening *:');
});


