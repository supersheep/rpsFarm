const 
  UP = 'up',
  RIGHT = 'right',
  DOWN = 'down',
  LEFT = 'left';
    

/*
	position:Number
	name:String
*/

const maxLevel = 5;

function Player(name){
	this.name = name;
	this.level = 0;
	this.opponent = null;
	this._guessing = false;
	console.log("init player",name);
}

Player.prototype = {
	constructor : Player,
	levelUp:function(){
		if(this.level < maxLevel){
			this.level += 1;	
		}
	},
	levelDown:function(){
		if(this.level < 0){
			this.level -= 1;
		}
	},
	playWith:function(opponent){
		this._guessing = true;
		this.opponent = opponent;
	},
	isGuessing:function(){
		return this._guessing;
	},
	moveTo:function(position){
		this.position = position;
	}
}

exports.player = Player