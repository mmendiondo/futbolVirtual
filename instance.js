//instance.js
function instance() {
	this.players = {};
	this.sockets = [];
	this.playsCount = 0;
	this.finishAtPlaysCount = 20;
}

module.exports = instance;