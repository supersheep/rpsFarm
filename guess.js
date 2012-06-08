var Player = require("./player").player;

function Guess(p1,p2){
	this.playerA = p1;
	this.playerB = p2;
	this.playground = [];
}

Guess.ACTIONS = {
	STONE:1,
	SCISSORS:2,
	CLOTH:3
};

Guess.prototype = {
	act:function(player,action){
		var result;
		this.playground.push({player:player,action:action});
		if(this.playground.length == 2){
			result = this.judge();
			this.playground = [];
		}
		return result;
	},
	judge:function(){
		var playground = this.playground;
		var actionA = playground[0].action;
		var actionB = playground[1].action;
		var ret;
		
		if( actionB - actionA == 1 || (actionB == 1 && actionA == 3) ){
			ret =  playground[0].player;
		}else if(actionB == actionA){
			ret = null;
		}else{
			ret = playground[1].player;
		}
		console.log(ret,playground);
		return ret;
		
	}
	
}

// test code
/*
var p1 = new Player("spud");
var p2 = new Player("nide");
var guess = new Guess(p1,p2);

guess.act(p1,Guess.ACTIONS.STONE);
guess.act(p2,Guess.ACTIONS.STONE);
*/
exports.guess = Guess;