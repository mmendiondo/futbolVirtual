var instance = require('./instance');

module.exports = {

	playerConnected : function (socket, msg)
	{
		instance.sockets.push(socket);
		instance.informSockets = [socket];

		var player = {};
		player.userName = JSON.parse(msg).userName;
		player.team = instance.players.length % 2;

		instance.players[socket.id] = player;
		instance.currentPlayer = player;
		return instance;
	},

	resolveGameAction : function (socket, msg)
	{
		instance.currentPlayer = instance.players[socket.id];

		instance.informSockets = [socket];

		var obj = JSON.parse(msg);
		var response = {};
		switch(obj.action)
		{
			case "pasar" : break;
			case "gambetear" : break;
			case "atajar" : break;
			case "paterAlArco" : break;
			case "marcar" : break;
			case "interceptar" : break;
			default : break;
		}
		
		response.actions = ["pasar","gambetear"];

		return instance;
	},

	playerDisconnected : function (socket)
	{
		var i = instance.sockets.indexOf(socket);
		delete instance.sockets[i];
		delete instance.players[socket.id];
	}
};