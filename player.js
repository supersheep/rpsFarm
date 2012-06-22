const 
  UP = 'up',
  RIGHT = 'right',
  DOWN = 'down',
  LEFT = 'left';
    

/*
	position:Number
	name:String
*/

function Player(name,id,maxLevel){
	this.name = name;
	this.maxLevel = maxLevel;
	this.socket = id;
	this.level = 1;
	this.opponent = null;
	this._guessing = false;
	this.isWin = false; 
	console.log("player:init",name);
}

Player.prototype = {
	constructor : Player,
	win:function(){
		console.log("player:win",this.name);
		this.isWin = true;	
	},
	levelUp:function(){
		console.log("player:level up",this.name);
		if(this.level < this.maxLevel && !this.isWin){
			this.level += 1;	
		}
	},
	levelDown:function(){
		console.log("player:level down",this.name);
		if(this.level > 1 && !this.isWin ){
			this.level -= 1;
		}
	},
	isGuessing:function(){
		return this.opponent !== null;
	},
	moveTo:function(position){
		if(!this.isWin){
			this.position = position;
		}
	}
}

exports.Player = Player