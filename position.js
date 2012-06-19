var EDGE = 8;

function Position(x,y){
	//console.log("x:%s,y:%s",x,y);
	this.x = x;
	this.y = y;
}

Position.match = function(a,b){
	return a.x == b.x && a.y == b.y;
} 

Position.prototype = {
	constructor : Position,
	left:function(){
		return new Position(
			this.x - 1 < 0 ? EDGE - 1 : this.x - 1 ,
			this.y);
	},
	right:function(){
		return new Position(
			this.x + 1 > EDGE - 1 ? 0 : this.x + 1 ,
			this.y);
	},
	up:function(){
		return new Position(
			this.x,
			this.y - 1 < 0 ? EDGE - 1 : this.y -1);
	},
	down:function(){
		return new Position(
			this.x,
			this.y + 1 > EDGE - 1 ? 0 : this.y + 1);
	}
}

exports.Position = Position;