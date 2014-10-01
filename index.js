var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

//["Dar Pase", "Patear al Arco", "Gambetear", "Atajar"];

var match = {};
match.positionsTeam1 = {
							"1" : {"userName": "","position" : "goalKeeper", "isCurrent" : false},
							"2" : {"userName": "","position" : "2", "isCurrent" : false},
							"3" : {"userName": "","position" : "3", "isCurrent" : false},
							"4" : {"userName": "","position" : "5", "isCurrent" : false},
							"5" : {"userName": "","position" : "9", "isCurrent" : true}
						};

match.positionsTeam2 = {
							"1" : {"userName": "","position" : "goalKeeper", "isCurrent" : false},
							"2" : {"userName": "","position" : "2", "isCurrent" : false},
							"3" : {"userName": "","position" : "3", "isCurrent" : false},
							"4" : {"userName": "","position" : "5", "isCurrent" : false},
							"5" : {"userName": "","position" : "9", "isCurrent" : false}
						};

var clients = [];

io.on('connection', function(socket){

	clients.push(socket);

	socket.on('disconnect', function() {
		var i = clients.indexOf(socket);
		delete clients[i];
	});

	socket.on('chat message', function(msg){
		io.emit('chat message', msg);
	});

	socket.on('connect game', function(msg){

		var obj = JSON.parse(msg);
		var _userName = obj.userName;
		var foundTeam = false;
		for(var player in match.positionsTeam1)
		{
			if(match.positionsTeam1[player].userName === ""){
				match.positionsTeam1[player].userName = _userName;
				obj.team = "1";
				obj.position = match.positionsTeam2[player].position;
				foundTeam = true;
				break;
			}
		}
		if(!foundTeam){
			for(var player in match.positionsTeam2)
			{
				if(match.positionsTeam2[player].userName == ""){
					match.positionsTeam2[player].userName = _userName;
					obj.team = "2";
					obj.position = match.positionsTeam2[player].position;
					break;
				}
			}
		}

		socket.emit('game connected', JSON.stringify(obj));
	});

	socket.on('game action', function(msg){
		var actions = resolveGameAction(msg);

		var i = clients.indexOf(socket);
		clients[i].emit('game available actions', actions);
		//io.emit('game available actions', actions);
	});

});


function resolveGameAction(message)
{

	//here resolve
		var obj = JSON.parse(message);

		var action = obj.action;
		var userName = obj.userName;
		var actions = [];

		//notifications limit to 3at the same time
		actions.push("Dar Pase");
		actions.push("Patear al Arco");
		actions.push("Gambetear");
		//actions.push("Atajar");

		return JSON.stringify(actions);
}

http.listen(process.env.PORT || 3000, function(){
  console.log('listening *:');
});


