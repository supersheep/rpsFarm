const 
  UP = 'up',
  RIGHT = 'right',
  DOWN = 'down',
  LEFT = 'left';
    

/*
	position:Number
	name:String
*/
function Player(name){
	this.name = name;
	this.level = 0;
	this.opponent = null;
	this._guessing = false;
	console.log("init player",name);
}


Player.prototype = {
	constructor : Player,
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