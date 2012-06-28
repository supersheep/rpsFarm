var Event = require('events').EventEmitter;
var Player = require("./player").Player;

function Guess(p1,p2){
	this.playerA = p1;
	this.playerB = p2;
	p1.opponent = p2.name;
	p2.opponent = p1.name;
	this.name = p1.name + ':' + p2.name;
	this.playground = [];
}

Guess.ACTIONS = {
	STONE:1,
	SCISSORS:2,
	CLOTH:3
};

Guess.transAction = function(num){
	return {1:"石头",2:"剪刀",3:"布"}[num];
}

Guess.prototype = new Event();

var fn = {
	constructor : Guess,
	start:function(){
		this.emit("start",{
			name:this.name,
			playerA:this.playerA,
			playerB:this.playerB
		});
	},
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
	isPlaying:function(){
		return this.playground.length == 1;
	},
	judge:function(){
		var playground = this.playground;
		var actionA = playground[0].action;
		var actionB = playground[1].action;
		var ret;
		
		if(actionB == actionA){
			this.emit("continue",{
				action:actionA,
				playerA:this.playerA,
				playerB:this.playerB
			});
			return;
		}else{
			if( actionB - actionA == 1 || (actionB == 1 && actionA == 3) ){
				winner = playground[0];
				loser = playground[1];
			}else{
				winner = playground[1];
				loser = playground[0];
			}
			// winner or loser has {action,player}
			this.close();
			this.emit("end",{
				winner:winner,
				loser:loser
			});
		}
		
	
	},
	close:function(){
		this.playerA.opponent = null;
		this.playerA._guessing = false;
		this.playerB.opponent = null;
		this.playerB._guessing = false;
	}
	
}


for(var i in fn){
	Guess.prototype[i] = fn[i];
}
exports.Guess = Guess;