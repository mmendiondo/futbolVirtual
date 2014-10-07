//instance.js
function instance() {
    this.sockets = [];
    this.informSockets = [];
	this.players = [];
	instance.playsCount = 0;
	instance.finishAtPlaysCount = 20;
}

module.exports = instance;