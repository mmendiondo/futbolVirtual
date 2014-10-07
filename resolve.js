module.exports = {

	playerConnected : function (instance, socket, msg)
	{
		instance.sockets[socket.id] = socket;
		instance.informSockets = [socket];

		saveInstance(instance);

		var player = {};
		player.userName = JSON.parse(msg).userName;
		player.socketId = socket.id;
		player.team = Object.keys(instance.players).length % 2;

		instance.players[socket.id] = player;
		instance.currentPlayer = player;
		return instance;
	},

	resolveGameAction : function (instance, socket, msg)
	{

		instance.currentPlayer = instance.players[socket.id];

		saveInstance(instance);
		var obj = JSON.parse(msg);

		saveEjecutant(instance.players[socket.id]);
		saveEjecutantFriend(getFriend(instance.players[socket.id]));
		saveEnemy(getEnemy(instance.players[socket.id]));

		switch(obj.action)
		{
			case "pase" :
				return resolvePase();
			case "gambetear" :
				return resolveGambeta();
			case "atajar" :
				return resolveAtaja();
			case "paterAlArco" :
				return resolvePatadaAlArco();
			case "marcar" :
				return resolveMarca();
			case "interceptar" :
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

function resolvePase(){

	//notificar al otro equipo...
	var obj = {};
	obj.actions = [];
	obj.actions.push(noti.intercepta);
	obj.informSockets = instance.sockets[instance.ejecutant.socketId];
	return obj;
}

function resolveGambeta(){
	//notificar al otro equipo...
	var obj = {};
	obj.actions.push(noti.marca);
	obj.informSockets = instance.sockets[instance.enemy.socketId];
	return obj;
}

function resolveAtaja(){
	//es gol o me quedo con la pelota,
	//si es gol notifico balon en pie al otro equipo

	var obj = {};
	obj.actions.push(noti.gol);
	obj.informSockets = instance.sockets[instance.ejecutant.socketId];
	return obj;
}

function resolvePatadaAlArco(){
	//notifico al otro equipo
	var obj = {};
	obj.actions.push(noti.ataja);
	obj.informSockets = instance.sockets[instance.enemy.socketId];
	return obj;
}
function resolveMarca(){
	var obj = {};
	//si marco bien currentplayer ballon en pie
	//si ejecutante con ballon en pie
	obj.actions = balonEnPie();

	obj.informSockets = instance.sockets[instance.enemy.socketId];
	return obj;
}
function resolveIntercepcion(){
	var obj = {};
	//si marco bien currentplayer ballon en pie
	//si amigo ejecutante con ballon en pie
	obj.actions = balonEnPie();

	obj.informSockets = instance.sockets[instance.enemy.socketId];
	return obj;
}

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

function default_notification()
{
	var noti = {};
	noti.dir = "auto";
	noti.lang = "auto";
	return noti;
}

function create_notification(tag)
{
	var default_noti = default_notification;
	default_noti.tag = tag;
	default_noti.icon = tag + "jpg";
	return default_noti;
}