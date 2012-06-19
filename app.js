
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
	maxPlayer:2
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
	
	function updatePlayerList(){
		io.sockets.emit("game:update player list",game.playerList());
	}
	
	function updateBoard(){
		io.sockets.emit("board:render",game.board.matrix);
	}
	
	game.on("new player",function(player){
		player.socket = socket.id;
		socket.set("role","player");
		console.log("event:game[new player]");
		updatePlayerList();
		updateBoard();
	});
	
	game.on("new watcher",function(watcher){
		watcher.socket = socket.id;
		socket.set("role","watcher");
		console.log("event:game[new watcher]",watcher);
		updatePlayerList();
		updateBoard();
	});
	
	game.on('remove player',function(){
		console.log("event:game[remove player]");
		updatePlayerList();
		updateBoard();
	});
	
	game.on('remove watcher',function(){
		console.log("event:game[remove watcher]");
		updatePlayerList();
		updateBoard();
	});
	
	
	
	game.on("wait",function(data){
		console.log("event:game[wait]",data);
		io.sockets.emit("game:wait",data);
	});
	
	game.on("start",function(matrix){
		console.log("event:game[start]");
		io.sockets.emit("game:start");
		updateBoard();
	});
	
	game.on('guess end',function(guess){
		console.log("event:game[guess end]",guess);
		var winner_player = guess.winner.player,
			winner_action = Guess.transAction(guess.winner.action),
			loser_player = guess.loser.player,
			loser_action = Guess.transAction(guess.loser.action);
		
		winner.player.levelUp();
		loser.player.levelDown();
		
		msg = util.format("%s win %s with %s vs %s",
			winner_player.name,
			loser_player.name,
			winner_action,
			loser_action);
		
		io.sockets.emit("new message",msg);
		updateBoard();
		connections[player.socket].emit("guess:end");
		connections[opponent.socket].emit("guess:end");
	});
	
	game.on('guess continue',function(data){
		console.log("event:game[guess continue]",data);
		connections[data.playerA.socket].emit("guess:reset");
		connections[data.playerB.socket].emit("guess:reset");
	});
	
	game.on('guess start',function(data){
		console.log("event:game[guess start]",data);
		connections[playerA.socket].emit("guess:start",{name:data.name,me:data.playerA,opponent:data.playerB});
		connections[playerB.socket].emit("guess:start",{name:data.name,me:data.playerB,opponent:data.playerA});
	});
	
	game.on("player full",function(){
		console.log("event:game[player full]");
		socket.emit("game:player full");
	});
	
	game.on("player exists",function(){
		console.log("event:game[player exists]");
		socket.emit("game:player exists");
	});
	
	game.on("watcher full",function(){
		console.log("event:game[watcher full]");
		socket.emit("game:watcher full");
	});
	
	game.on("watcher exists",function(){
		console.log("event:game[watcher exists]");
		socket.emit("game:watcher exists");
	});
	
	game.on('player move',function(matrix){
		console.log("event:game[player move]");
		io.sockets.emit("board:render",matrix);
	})
	
	// bind customs events
	socket.on('attend',function(data){
		var name = data.name;
		console.log("event:socket[attend]",data);
		game.addPlayer(name);
		socket.set("name",name);
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
	
	socket.on('disconnect', function () {
		console.log("event:socket[disconnect]");
		socket.get("name",function(err,name){
			if(name){
				socket.get('role',function(err,role){
					if(role === "watcher"){
						game.removeWatcher(name);
					}else if(role === "player"){
						game.removePlayer(name);
					}
					
					if(game.started()){
						updateBoard();
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
