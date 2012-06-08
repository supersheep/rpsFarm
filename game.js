var Position = require('./position').position;
var Guess = require('./guess').guess;
var Player = require('./player').player;

/*
{
	players:Player[]
	maxPlayer:Number,
	edge: Number
	matrix:Player[]
}
*/

var Game = function(opt){
	var edge = opt.edge,
		maxPlayer = opt.maxPlayer,
		matrix = [];
	
	// TODO 推算maxPlayer与edge的关系，在不符合条件时返回，demo预设8x8 8players
	
	for(var i = 0 ; i < edge ; i++ ){
		matrix[i] = matrix[i] || [];
		for(var j = 0; j < edge ; j++){
			matrix[i][j] = null;
		}
	}

	this.edge = opt.edge;
	this.maxPlayer = maxPlayer;
	this.matrix = matrix;
	this.players = [];
	this.guesses = [];
	
	console.log("init game");
	
}

/*
	addUser
	randomEmptyPosition
	canmove
*/
Game.prototype = {
	
	constructor :Game,
	
	reachMax:function(){
		return this.players.length == this.maxPlayer;
	},
	isFree:function(position){
		return this.getPosition(position) === null;
	},
	
	getFreeSpace:function(){
		var matrix = this.matrix,
			edge = this.edge,
			pos,
			index,
			rest = [];
		
		for(var i = 0 ; i < edge ; i++ ){
			for(var j = 0; j < edge ; j++ ){
				pos = new Position(j,i);
				if(this.isFree(pos)
				&& this.isFree(pos.left())
				&& this.isFree(pos.right())
				&& this.isFree(pos.up())
				&& this.isFree(pos.down())
				){
					rest.push([j,i]);
				}
			}
		}
		
		index = Math.floor(Math.random() * rest.length);
		
		return rest[index];
	},
	playGuess:function(name,action){
		var player = this.getPlayer(name);
		var guess = this.getGuess(name);
		return guess.act(player,action);
	},
	movePlayer:function(name,dir){
		var cur,
			next,
			player,
			edge = this.edge,
			matrix = this.matrix;
		
		// get index
		player = this.getPlayer(name);
		
		if(!player){
			console.log("player " + name + " not found",this.players);
			return;
		}
		
		cur = player.position;
		
		if(!cur[dir]){
			console.log("func " + dir + " not exist");
			return;
		}
		
		next = cur[dir]();
		
		// 可移动
		if(!this.getPosition(next)){
			this.exchange(cur,next);
			player.position = next;
			return next; // 检查周围有无可以猜拳的对手
		}
		//this.putPlayer(player,position);
		//player.moveTo(position);
		//this.matrix[position.x][position.y] = player;
	},
	// 有就建立一个猜拳游戏
	checkConnection:function(position){
		var dir = ["up","down","left","right"];
		var playerA = this.getPosition(position);
		var playerB;
		if(!playerA){return;}
		
		for(var i = 0 , l = dir.length; i < l ; i++){
			playerB = this.getPosition(position[dir[i]]());
			if(playerB && !playerB.isGuessing()){
				this.newGuess(playerA,playerB);
				return {playerA:playerA,playerB:playerB}; 
			}
		}	
		return null;
	},
	newGuess:function(playerA,playerB){
		this.guesses.push(new Guess(playerA,playerB));
	},
	exchange:function(cur,next){
		var curP,nextP,tmp;
		
		curP = this.getPosition(cur);
		nextP = this.getPosition(next);
		
		this.setPosition(cur,nextP);
		this.setPosition(next,curP);
	},
	setPosition:function(position,val){
		this.matrix[position.y][position.x] = val;
	},
	getPosition:function(position){
		if(position){
			return this.matrix[position.y][position.x];
		}else{
			return null;
		}
	},
	getGuess:function(name){
		var guesses = this.guesses,
			guess;
		for(var i = 0 , l = guesses.length ; i < l ; i++){
			guess = guesses[i];
			if(guess.playerA.name == name || guess.playerB.name == name){
				return guess;
			} 
		}
		return null;
	},
	getPlayer:function(name){
		var matrix = this.matrix,
			edge = this.edge;
		
		for(var i = 0 ; i < edge ; i++){
			for(var j = 0 ; j < edge ; j++){
				player = this.getPosition({x:j,y:i});
				if(player && player.name == name){
					return player;
				}
			}
		}
		return null;
	},
	putPlayer:function(player,position){
		player.moveTo(position);
		this.setPosition(position,player);
	},
	addPlayer:function(name){
		var player,position,coord,edge;
		if(this.players.length < this.maxPlayer){
			if(!this.hasPlayer(name)){
				coord = this.getFreeSpace();
				edge = this.edge;
				player = new Player(name);
				position = new Position(coord[0],coord[1]);
				this.putPlayer(player,position);
				this.players.push(player);
				return player;
			}else{
				console.log(name + " existing");
				return null;
			}
		}else{
			console.log("room is full");
			return null;
		}
	},
	
	removePlayer:function(name){
		var players = this.players,
			player = this.getPlayer(name),
			matrix = this.matrix,
			position;
			
		if(player){
			position = player.position;
			for(var i = 0 , l = players.length; i < l ; i++){
				if(players[i].name == name){
					players.splice(i,1);
					break;
				}
			}
			console.log("remove player "+name);
			
			matrix[position.y][position.x] = null;
		}
	},
	hasPlayer:function(name){
		return this.players.some(function(e){
			return e.name === name;
		});	
	},
	start:function(){
		this._started = true;
	},
	started:function(){
		return this._started;
	},
	// function only for console demo
	show:function(){
		var edge = this.edge;
		var matrix = this.matrix;
		var player;
		
		for(var i = 0 ; i < edge ; i++){
			for(var j = 0; j < edge ; j++){
				player = this.getPosition({x:j,y:i});
				if(player){
					process.stdout.write(player.name+","+player.level+"\t");	
				}else{
					process.stdout.write("n\t");
				}
			}
			process.stdout.write('\n');
		}
	},
	userlist:function(){
		console.log(this.players);
		
	}
	
	
}

exports.game = Game;