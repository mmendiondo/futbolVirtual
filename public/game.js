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
    socket.emit('connect game', JSON.stringify({"userName":$("#userName").val()}));
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
    if(perm === "granted")
      $(".modalBox").center().show();
      if (Game.player.alreadyPlaying)
        $(".modalBox").slideUp(1000);
    });
}

$(document).ready(function() {authorizeNotification();});

$("#show").click(function() {showNotification({"title" :"pase", "action":"pase"});});

///region conections
function showNotification(noti) {
  var notification = new Notification(noti.title, noti);

  notification.onclick = function(){
    notification.close();
    socket.emit('game action',  JSON.stringify(noti));
  };

  notification.onshow = setTimeout(function(){notification.close();}, 5000);
}
