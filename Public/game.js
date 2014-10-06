var Game = {};

var socket = io();

Game.player = {};
Game.player.position = "";
Game.player.userName = "";
Game.player.alreadyPlaying = false;


$('form').submit(function(){
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});

socket.on('chat message', function(msg){
  $('#messages').append($('<li>').text(msg));
});

socket.on('game available actions', function(msg){
  var availableActions = JSON.parse(msg);
  $(availableActions).each(function()
  {
    showNotification(this);
  });
});

function connectPlayer()
{
    // Identify user and send to conect
    var msg=JSON.stringify({"userName":$("#userName").val()});
    socket.emit('connect game', msg);
}

socket.on('game connected', function(msg){
  gameConnected(msg);  
});

function gameConnected(msg)
{
    $(".modalBox").html("<div style='padding-top:30px;'>Ya estás Jugando!</div>");
    Game.player.alreadyPlaying = true;
    $(".modalBox").slideUp(1000);
    Game.player = JSON.parse(msg);
}

function authorizeNotification() {
  Notification.requestPermission(function(perm) {
    (perm === "granted")
      $(".modalBox").center().show();
      if (Game.player.alreadyPlaying) 
        $(".modalBox").slideUp(1000);
    });
}

$(document).ready(function() {authorizeNotification();});

///region conections
function showNotification(action) {
  var notification = new Notification(action.tag, action);

  notification.onclick = function(){
    notification.close();
    socket.emit('game action', JSON.stringify(
      {
        "action" : action.tag, "userName" : Game.player.userName}));
  };

  notification.onshow = setTimeout(function(){notification.close();}, 5000);
}
