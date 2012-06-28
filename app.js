
/**
 * Module dependencies.
 */

var util = require('util'),
	express = require('express'),
	socket = require('socket.io'), 
	Game = require('./game').Game,
	Guess = require('./game').Guess,
	routes = require('./routes');

var app = module.exports = express.createServer();
	io = socket.listen(app);
	
io.set('log level', 1);

var connections = {};

var game = new Game({
	edge:8,
	maxLevel:5,
	maxPlayer:4
});


function updatePlayerList(){
	io.sockets.emit("game:update player list",game.playerList());
}

function updateBoard(){
	io.sockets.emit("board:render",game.board.matrix);
}

game.on("end",function(data){
	io.sockets.emit("game:end",data);
	io.sockets.emit("new message","游戏结束");
});

game.on("new player",function(player){
	var socket = connections[player.socket];
	socket.set("name",player.name);
	socket.set("role","player");
	console.log("event:game[new player]");
	io.sockets.emit("new message","玩家" + player.name + "刚刚加入");
	updatePlayerList();
	updateBoard();
});

game.on("new watcher",function(watcher){
	var socket = connections[watcher.socket];
	socket.set("name",watcher.name);
	socket.set("role","watcher");
	console.log("event:game[new watcher]",watcher);
	io.sockets.emit("new message","观众" + watcher.name + "刚刚加入");
	updatePlayerList();
	updateBoard();
});

game.on('remove player',function(name){
	console.log("event:game[remove player]");
	io.sockets.emit("new message",name + "退出");
	updatePlayerList();
	updateBoard();
});

game.on('remove watcher',function(name){
	console.log("event:game[remove watcher]");
	io.sockets.emit("new message",name + "退出");
	updatePlayerList();
	updateBoard();
});



game.on("wait",function(data){
	console.log("event:game[wait]",data);
	io.sockets.emit("game:wait",data);
});

game.on("start",function(){
	console.log("event:game[start]");
	io.sockets.emit("game:start");
	io.sockets.emit("new message","游戏开始");
	updateBoard();
});


game.on('guess start',function(data){
	console.log("event:game[guess start]",data.name);
	connections[data.playerA.socket].emit("guess:start",{name:data.name,me:data.playerA,opponent:data.playerB});
	connections[data.playerB.socket].emit("guess:start",{name:data.name,me:data.playerB,opponent:data.playerA});
});

game.on('guess continue',function(data){
	console.log("event:game[guess continue]",data);
	
	var socketA = connections[data.playerA.socket],
		socketB = connections[data.playerB.socket],
		
		action = Guess.transAction(data.action),
		msg = util.format("%s 对 %s 平局",action,action);
		
	socketA.emit("guess:reset",action);
	socketA.emit("new message",msg);
	
	socketB.emit("guess:reset");
	socketB.emit("new message",msg);
});

game.on('guess end',function(guess){
	console.log("event:game[guess end]",guess.winner.name,guess.loser.name);
	var winner_player = guess.winner.player,
		winner_action = Guess.transAction(guess.winner.action),
		loser_player = guess.loser.player,
		loser_action = Guess.transAction(guess.loser.action);
	
	winner.player.levelUp();
	loser.player.levelDown();
	
	msg = util.format("%s 以 %s 对 %s 打败了 %s",
		winner_player.name,
		winner_action,
		loser_action,
		loser_player.name);
	
	io.sockets.emit("new message",msg);
	updateBoard();
	connections[winner_player.socket].emit("guess:end");
	connections[loser_player.socket].emit("guess:end");
});

game.on("player win",function(player){
	var msg = util.format("玩家 %s 胜出",player.name);
	io.sockets.emit("new message",msg);
	updateBoard();	
	updatePlayerList();
});

game.on("player full",function(data){
	console.log("event:game[player full]");
	connections[data.socketid].emit("game:player full",data.name);
});

game.on("player exists",function(data){
	console.log("event:game[player exists]",data.name);
	connections[data.socketid].emit("game:player exists",data.name);
});


game.on('ended',function(data){
	console.log("event:game[ended]");
	connections[data.socketid].emit("game:ended");
});

game.on("watcher full",function(data){
	console.log("event:game[watcher full]");
	connections[data.socketid].emit("game:watcher full",data.name);
});

game.on("watcher exists",function(data){
	console.log("event:game[watcher exists]",data.name);
	connections[data.socketid].emit("game:watcher exists",data.name);
});

game.on('player move',function(matrix){
	console.log("event:game[player move]");
	io.sockets.emit("board:render",matrix);
});

// Configuration
app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
});

app.configure('development', function(){
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

// Routs
app.get('/',function(req,res){
	res.sendfile(__dirname + '/index.html');
});

/*
	Socket Events
	wait
	game start
	new player
*/

// bind connection event
io.sockets.on('connection',function(socket){
	var id = socket.id;
	connections[id] = socket;
	
	console.log("event:io.sockets[connection]",id);
	
	
	
	// bind customs events
	socket.on('attend',function(data){
		var name = data.name;
		console.log('attend emitted!!!',socket.id);
		console.log("event:socket[attend]",data);
		game.addPlayer(name,socket.id);
	});
	
	socket.on('guess act',function(data){
		var player = data.player,
			guess = data.guess,
			action = data.action;
		
		console.log("event:socket[guess act]",data);
		game.playGuess(player,guess,action);
	});
	
	socket.on('move',function(dir){
		if(["up","down","left","right"].indexOf(dir) < 0){
			return;
		}
		
		console.log("event:socket[move]",dir);
		socket.get('name',function(err,name){
			game.movePlayer(name,dir);
		});
	});
	
	socket.on('message',function(data){
		io.sockets.emit("new chat",data.name+":"+data.msg);
	});
	
	socket.on('disconnect', function () {
		console.log("event:socket[disconnect]");
		socket.get("name",function(err,name){
			if(name){
				socket.get('role',function(err,role){
					if(role === "watcher"){
						game.removeWatcher(name);
					}else if(role === "player"){
						console.log("removing player " + name); 
						game.removePlayer(name);
					}
					
					if(game.started()){
						updateBoard();
						game.checkStatus();
					}
					delete connections[socket.id];
					console.log("game players:",game.players.all().map(function(player){return player.name}));
					console.log(Object.keys(connections));
					
				});
			}
		});
	});
});



app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
