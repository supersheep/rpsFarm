var Event = require('events').EventEmitter;
var Position = require('./position').Position;
var Guess = require('./guess').Guess;
var List = require('./list').List;
var Player = require('./player').Player;
var Watcher = require('./watcher').Watcher;

/*
{
	players:Player[]
	maxPlayer:Number,
	edge: Number
	matrix:Player[]
}
*/

var Board = function(game,edge){
	var matrix = [];
	
	for(var i = 0 ; i < edge ; i++ ){
		matrix[i] = matrix[i] || [];
		for(var j = 0; j < edge ; j++){
			matrix[i][j] = null;
		}
	}
	this.game = game;
	this.matrix = matrix;
};

Board.prototype = {
	get:function(pos){
		return this.matrix[pos.y][pos.x];
	},
	set:function(pos,val){
		this.matrix[pos.y][pos.x] = val
	},
	kick:function(player){
		this.set(player.position,null);
	},
	put:function(pos,player){
		if(pos){
			player.moveTo(pos);
		}
		
		if(player.position){
			this.set(player.position,player);
		}
	},
	free:function(pos){
		return !this.get(pos);
	},
	exchange:function(cur,next){
		var pcur,pnext;
		
		pcur = this.get(cur);
		pnext = this.get(next);
		
		pcur && pcur.moveTo && pcur.moveTo(next);
		pnext && pnext.moveTo && pnext.moveTo(pcur);
		
		this.set(cur,pnext);
		this.set(next,pcur);
	},
	checkOpponent:function(pos){
		var self = this,
			playerA = this.get(pos),
			playerB;
			
		if(!playerA){return;}
		
		try{
		["up","down","left","right"].forEach(function(dir){
			playerB = self.get(pos[dir]());
			if(playerB && !playerB.isGuessing() && playerB.level === playerA.level){
				throw {playerA:playerA,playerB:playerB};
			}
		});
		}catch(e){
			console.log("found opponent");
			self.game.newGuess(e.playerA,e.playerB);
			// found
		}
	},
	greenland:function(){
		var self = this,
			matrix = this.matrix,
			index,rest = [];
		
		matrix.forEach(function(row,i){
			row.forEach(function(grid,j){
				var pos = new Position(j,i);
				if(self.free(pos)
				&& self.free(pos.left())
				&& self.free(pos.right())
				&& self.free(pos.up())
				&& self.free(pos.down())
				){
					rest.push(pos);
				}	
			});
		});
		
		index = Math.floor(Math.random() * rest.length);
		
		return rest[index];
	}
}


var Game = function(opt){
	var edge = opt.edge,
		maxPlayer = opt.maxPlayer;
		maxLevel = maxPlayer > opt.maxLevel ? opt.maxLevel : maxPlayer;
	// TODO 推算maxPlayer与edge的关系，在不符合条件时返回，demo预设8x8 8players
	

	this.edge = opt.edge;
	this.maxLevel = maxLevel;
	this.maxPlayer = maxPlayer;
	this.board = new Board(this,edge);
	this.players = new List(Player,maxPlayer);
	this.watchers = new List(Watcher);
	this.winners = new List(Player);
	this.guesses = new List(Guess);
	
	console.log("init game,maxPlayer,maxLevel",maxPlayer,maxLevel);
	
}

/*
	addUser
	randomEmptyPosition
	canmove
*/

var fn = {
	
	constructor :Game,
	
	
	playGuess:function(player,guess,action){
		console.log("game:play guess:",player,guess,action);
		var player = this.players.get(player),
			guess = this.guesses.get(guess),
			action = Guess.ACTIONS[action];
		guess.act(player,action);
	},
	movePlayer:function(name,dir){
		var cur,
			next,
			player,
			edge = this.edge,
			matrix = this.matrix;
		
		// get index
		player = this.players.get(name);
		
		if(!player){
			console.log("player " + name + " not found",this.players);
			return;
		}
		
		cur = player.position;
		next = cur[dir]();
		
		// 可移动
		if(this.board.free(next) && !player.isGuessing()){
			this.board.exchange(cur,next);
			this.board.checkOpponent(next);
			this.emit("player move",this.board.matrix);			
		}
	},
	newGuess:function(playerA,playerB){
		console.log("game:new Guess");
		var self = this,
			guess = new Guess(playerA,playerB);
		
		guess.on("start",function(data){
			self.emit("guess start",{
				name:data.name,
				playerA:data.playerA,
				playerB:data.playerB
			});
		});
		
		guess.on("end",function(data){
			self.emit("guess end",{
				winner:data.winner,
				loser:data.loser
			});
			self.checkStatus();
		});
		
		guess.on("continue",function(data){
			self.emit("guess continue",{
				action:data.action,
				playerA:data.playerA,
				playerB:data.playerB
			});
		});
		
		guess.start();
		this.guesses.add(guess);
	},
	closeGuess:function(guess){
		var guesses = this.guesses;
		guess.close();
		guesses.remove(guess);
	},
	getGuess:function(name){
		return this.guesses.get(name);
	},
	getPlayer:function(name){
		var matrix = this.matrix,
			edge = this.edge;
		
		console.log("getting player "+name);
		return this.players.get(name);
	},
	checkStatus:function(){
		var players = this.players.all(),
			winners = this.winners,
			maxLevel = this.maxLevel;
		
		for(var i = 0 ;player = players[i] ; i++){
			console.log("judge player.level,maxLevel",player.level,maxLevel);
			if(player.level == maxLevel){
				player.win();
				this.players.remove(player);
				this.board.kick(player);
				winners.add(player);
				this.emit("player win",player);
			}
			
			if(this.players.count() < maxLevel){
				this.emit("end",{
					winners:this.winners.all(),
					players:this.players.all()
				});
				break;
			}
		}
		
		
	},
	addPlayer:function(name,socketid){
		var player,watcher,count,
			eventdata = {name:name,socketid:socketid};
		try{
			console.log("try new player with maxlevel",this.maxLevel);
			player = new Player(name,socketid,this.maxLevel);
			this.players.add(player);
			this.board.put(this.board.greenland(),player);
			
			count = this.players.count();
			max = this.players.max;
			
			this.emit("new player",player);
			this.emit("wait",{
				current:count,
				max:max
			});
			if(count === max ){
				this.start();
			}
		}catch(err){
			if(err === "full" ){
				try{
					watcher = new Watcher(name,socketid);
					this.watchers.add(watcher);
					this.emit("new watcher",watcher);
				}catch(err){					
					if(err === "full"){
						this.emit("watcher full",eventdata);
					}else if(err === "exists"){
						this.emit("watcher exists",eventdata);
					}else{
						throw err;
					}
				}
				this.emit("player full",eventdata);
			}else if(err === "exists"){
				this.emit("player exists",eventdata);
			}else{
				throw err;
			}
		}
	},
	removeWatcher:function(name){
		var watcher = this.watchers.get(name);
		
		this.watchers.remove(name);
		this.emit("remove watcher",name);
	},
	removePlayer:function(name){
		var player = this.players.get(name),
			matrix = this.matrix,
			position;
		
		this.players.remove(name);
		this.board.kick(player);
		this.emit("remove player",name);
	},
	start:function(){
		if(!this._started){
			console.log("game start");
			this.emit("start",this.board.matrix);
			this._started = true;
		}
	},
	started:function(){
		return this._started;
	},
	playerList:function(){
		return {
			players:this.players.all(),
			watchers:this.watchers.all(),
			maxPlayer:this.maxPlayer	
		};
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
};

Game.prototype = new Event();

for(var i in fn){
	Game.prototype[i] = fn[i];
}

exports.Game = Game;
exports.Guess = Guess;



