var socket = io.connect("http://localhost:3000");

$(document).ready(function(){
		
	var name = prompt("input your code");
	
	if(name){
		socket.emit('attend',{
			name:name
		});
		
		socket.on('updatePlayerList',gameClient.renderPlayerList);
		
		socket.on('updateView',function(matrix){
			gameClient.renderView(matrix);
		});
		
		socket.on('gameStart',function(matrix){
			gameClient.renderView(matrix);
		});
		
		socket.on('showGuessView',function(opponent){
			gameClient.renderGuessView(opponent);
		});
		
		$(document).on('keyup',function(e){
			var keymap = {
				37:"left",
				38:"up",
				39:"right",
				40:"down"
			};
			socket.emit("move",keymap[e.keyCode]);
		});
		
	}

	
	
});