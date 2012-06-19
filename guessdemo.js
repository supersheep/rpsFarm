var Guess = require('./guess').Guess;
var Player = require('./player').Player;

var p1 = new Player("spud");
var p2 = new Player("nide");
var p3 = new Player("ben");
var guess = new Guess(p1,p2);

guess.act(p1,Guess.ACTIONS.CLOTH);
guess.act(p2,Guess.ACTIONS.STONE);
guess.act(p1,Guess.ACTIONS.CLOTH);
guess.act(p2,Guess.ACTIONS.CLOTH);
guess.act(p1,Guess.ACTIONS.SCISSORS);
guess.act(p2,Guess.ACTIONS.STONE);
