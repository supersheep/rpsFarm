
/**
 * Module dependencies.
 */

var express = require('express'),
	socket = require('socket.io'), 
	Game = require('./game').game,
	routes = require('./routes');

var app = module.exports = express.createServer();
	io = socket.listen(app);
	
	
var connections = {};

var game = new Game({
	edge:8,
	maxPlayer:4
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

// bind connection event
io.sockets.on('connection',function(socket){
	var id = socket.id;
	connections[id] = socket;
	socket.on('losePlayer',function(name){
	});
	
	// bind customs events
	socket.on('attend',function(data){
		var name = data.name;
		var player = game.addPlayer(name);
		if(player){
			player.socket = socket.id;
		
			socket.set('name',name);
			
			if(game.reachMax()){
				game.start();
				io.sockets.emit("updateView",game.matrix);
			}else{
				io.sockets.emit("wait",game);
			}
			
			io.sockets.emit("updatePlayerList",game);
		}
	});
	
	socket.on('move',function(dir){
		socket.get('name',function(err,name){
			var next = game.movePlayer(name,dir);
			var players = game.checkConnection(next);
			var playerA,playerB;
			if(players){
				playerA = players.playerA;
				playerB = players.playerB;
				game.newGuess(playerA,playerB);
				connections[playerA.socket].emit("showGuessView",playerB);
				connections[playerB.socket].emit("showGuessView",playerA);
				
			}
			io.sockets.emit("updateView",game.matrix);
		})
		
	})
	
	socket.on('disconnect', function () {
		socket.get('name',function(err,name){
			if(name){
				game.removePlayer(name);
				if(game.started()){
					io.sockets.emit("updateView",game.matrix);	
				}
				delete connections[socket.id];
				io.sockets.emit("updatePlayerList",game);
			}
		});
	});
});



app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
