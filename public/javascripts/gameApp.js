var socket = io.connect("http://localhost:3000");

$(document).ready(function(){
		
	var name = prompt("input your code");
	var chatinput = $("#chat_input");
	
	if(name){
	
		chatinput.keyup(function(e){
			if(e.keyCode == 13){
				socket.emit('message',{
					name:name,
					msg:chatinput.val()
				});
				chatinput.val('');
			}
			
		})
	
	
		socket.emit('attend',{
			name:name
		});
		
		socket.on('new message',function(msg){
			gameClient.message("sys",msg);
		});
		
		socket.on('new chat',function(msg){
			gameClient.message("usr",msg);
		});
		
		socket.on('game:update player list',function(data){
			gameClient.renderPlayerList(data.winners,
			data.players,
			data.watchers);
		});
				
		socket.on('game:player full',function(){
			console.log("game:player full");	
			gameClient.start();
		});
		
		socket.on('game:start',function(){
			console.log('game:start');
			gameClient.start();
		});
		
		socket.on('game:wait',function(obj){
			gameClient.waitPlayer(obj.max,obj.current);
		});
		
		socket.on('game:end',function(obj){
			gameClient.end(obj);
		});
		
		socket.on('board:render',function(matrix){
			gameClient.renderView(matrix);
		});
		
		socket.on('guess:start',function(data){
			// playername, guessname
			console.log("guess:start");
			gameClient.bindGuessView(name,data.name);
			gameClient.renderGuessView(data.me,data.opponent);
		});
		
		socket.on('guess:reset',function(){
			gameClient.resetGuessView();	
		});
		
		socket.on('guess:end',function(){
			gameClient.closeGuessView();
		});
		
		
		
	}
});

$(document).on('keyup',function(e){
	var keymap = {
		37:"left",
		38:"up",
		39:"right",
		40:"down"
	};
	if(gameClient.started){
		socket.emit("move",keymap[e.keyCode]);
	}
});