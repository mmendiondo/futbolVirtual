module.exports = {

	playerConnected : function (instance, socket, msg)
	{
		var socketId = socket.id;
		instance.sockets[socketId] = socket;

		var player = {};
		player.userName = JSON.parse(msg).userName;
		player.socketId = socketId;
		player.team = Object.keys(instance.players).length % 2;

		instance.players[socketId] = player;
		instance.currentPlayer = player;

		saveInstance(instance);

		var obj = {};
		obj.messages = {};
		obj.informSockets = [];
		obj.informSockets.push(socket);

		if(Object.keys(instance.sockets).length > 2)
		{
			obj.messages.message = "A Jugar";
			obj.messages.player = player;
			obj.messages.state = "success";
			obj.messages.buttonText = "Empezar partido";
			obj.messages.start = true;
		}
		else{
			obj.messages.message = "Faltan jugadores";
			obj.messages.player = player;
			obj.messages.state = "error";
			obj.messages.buttonText = "ok";
			obj.messages.start = false;
		}

		return obj;
	},

	resolveGameAction : function (instance, socket, msg)
	{
		var socketId = socket.id;
		instance.currentPlayer = instance.players[socketId];

		instance.playsCount += 1;

		var obj = JSON.parse(msg);

		saveEjecutant(instance.players[socketId]);
		saveEjecutantFriend(getFriend(instance.players[socketId]));
		saveEnemy(getEnemy(instance.players[socketId]));

		switch(instance.playsCount)
		{
			case instance.finishAtPlaysCount:
				return resolveFinaliza();
		}

		saveInstance(instance);

		switch(obj.tag)
		{
			case "pase" :
				return resolvePase();
			case "gambeta" :
				return resolveGambeta();
			case "ataja" :
				return resolveAtaja();
			case "patada" :
				return resolvePatadaAlArco();
			case "marca" :
				return resolveMarca();
			case "intercepta" :
				return resolveIntercepcion();
			default : break;
		}

		return null;
	},

	playerDisconnected : function (instance, socket)
	{
		var i = instance.sockets.indexOf(socket);
		delete instance.sockets[i];
		delete instance.players[socket.id];
	}
};

var instance = null;


function balonEnPie()
{
	var arr = [];
	arr.push(noti.pasa);
	arr.push(noti.gambeta);
	arr.push(noti.patada);
	return arr;
}

var noti = {};

noti.pasa = create_notification("pase");
noti.gambeta = create_notification("gambeta");
noti.ataja = create_notification("ataja");
noti.patada = create_notification("patada");
noti.marca = create_notification("marca");
noti.intercepta = create_notification("intercepta");
noti.gol = create_notification("gol");
noti.empiezaPartido = create_notification("empezo");
noti.terminaPartido = create_notification("termino");

function default_notification()
{
	var noti = {};
	noti.dir = "auto";
	noti.lang = "auto";
	return noti;
}

function create_notification(tag)
{
	var default_noti = default_notification();
	default_noti.tag = tag;
	default_noti.icon = tag + ".jpg";
	default_noti.fires_action = true;
	return default_noti;
}

function saveInstance(_instance)
{
	instance = _instance;
}

function getEnemy(player)
{
	for(var i in instance.players)
	{
		if(instance.players[i].socketId != player.socketId &&
			instance.players[i].team != player.team )
			return instance.players[i];
	}
}

function getFriend(player)
{
	for(var i in instance.players)
	{
		if(instance.players[i].socketId != player.socketId &&
			instance.players[i].team == player.team )
			return instance.players[i];
	}
}
function saveEjecutant(player)
{
	instance.ejecutant = player;
}

function saveEjecutantFriend(player)
{
	instance.ejecutantFriend = player;
}

function saveEnemy(player)
{
	instance.enemy = player;
}

function newResponse(sockets, actions)
{
	var obj = {};
	obj.actions = actions;
	obj.informSockets = sockets;
	return obj;
}

function resolveEmpieza()
{
	return newResponse(instance.sockets, [noti.empieza]);
}

function resolveFinaliza()
{
	return newResponse(instance.sockets, [noti.finaliza]);
}

function resolvePase()
{
	return newResponse([instance.sockets[instance.ejecutant.socketId]], [noti.intercepta]);
}

function resolveGambeta()
{
	return newResponse([instance.sockets[instance.enemy.socketId]], [noti.marca]);
}

function resolveAtaja()
{
	//es gol o me quedo con la pelota,
	//si es gol notifico balon en pie al otro equipo
	var golNoti = noti.gol;
	golNoti.fires_action = false;
	return newResponse([instance.sockets[instance.ejecutant.socketId]], [golNoti]);
}

function resolvePatadaAlArco()
{
	return newResponse([instance.sockets[instance.enemy.socketId]], [noti.ataja]);
}
function resolveMarca()
{
	//si marco bien currentplayer ballon en pie
	//si ejecutante con ballon en pie
	return newResponse([instance.sockets[instance.enemy.socketId]], balonEnPie());
}
function resolveIntercepcion()
{
	return newResponse([instance.sockets[instance.enemy.socketId]], balonEnPie());
}
