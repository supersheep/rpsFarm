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
		
		socket.on('resetGuessView',function(){
			gameClient.resetGuessView();	
		});
		
		socket.on('closeGuessView',function(){
			gameClient.closeGuessView();
		})
		
		socket.on('showGuessView',function(data){
			gameClient.renderGuessView(data.me,data.opponent);
		});
		
		$("#guessview").find('.item').on('click',function(e){
			var el = $(this);
			var action = el.attr('class').split(' ')[1].toUpperCase();
			$("#guessview").find('.item').hide();
			el.show();
			
			socket.emit("playGuess",{
				name:name,
				action:action
			});
		})
		
		
	}
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