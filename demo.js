var Game = require('./game').game;
var Player = require('./player').player;

var game = new Game({
	edge:8,
	maxPlayer:8
});


// game.addPlayer("spud");
game.addPlayer("spud");
game.addPlayer("mike");
game.addPlayer("lnker");
game.addPlayer("kael");
game.addPlayer("cindy");
game.addPlayer("stan");
game.addPlayer("luke");
game.addPlayer("tide");

game.show();
game.userlist();
game.removePlayer("spud");
game.show();
game.userlist();
game.addPlayer("iva");
game.show();




game.movePlayer("spud","left");

game.show();

game.movePlayer("spud","right");

game.show();

game.movePlayer("spud","up");

game.show();

game.movePlayer("spud","down");

game.show();

