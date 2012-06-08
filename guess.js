var Player = require("./player").player;

function Guess(p1,p2){
	this.playerA = p1;
	this.playerB = p2;
	p1.opponent = p2.name;
	p2.opponent = p1.name;
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
		var playground = this.playground;
		
		console.log(player.name + " act " + action )		
		if(playground[0] && playground[0].player.name == player.name){
			console.log(player.name + " already acted")
			return null;
		}else if(
			this.playerA != player
			&& 
			this.playerB != player
		){
			console.log("illeagle player " + player.name);
			return null;
		}
		
		playground.push({player:player,action:action});
		
		if(playground.length == 2){
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
		
		if(ret === null){
			console.log("no one wins");
		}else{
			console.log(ret.name + " wins");
		}
		return ret;
	},
	close:function(){
		this.playerA.opponent = null;
		this.playerA._guessing = false;
		this.playerB.opponent = null;
		this.playerB._guessing = false;
	}
	
}

exports.guess = Guess;