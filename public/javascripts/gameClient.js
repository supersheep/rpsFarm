var gameClient = {
	renderView:function(matrix){
		var board = $('#board');
			
		board.empty();
		for(var i = 0 , l = matrix.length ; i < l ; i++){
			var row = $('<div class="row" />');
			var rowdata = matrix[i];
			for(var j = 0,m=rowdata.length ; j < m ; j++){
				var player = rowdata[j];
				var level = player ? "level" + player.level : "";
				var name = player ? player.name : "";
				var grid = $('<div class="grid ' + level + '" />').html(name);
				row.append(grid);
			}
			board.append(row);
		}
		
	},
	resetGuessView:function(){
		
	},
	closeGuessView:function(){
		var guessview =	$("#guessview");
	},
	renderGuessView:function(me,opp){
		var guessview =	$("#guessview");
		guessview.show();
		guessview.find('.playerA').html(me.name);
		guessview.find('.playerB').html(opp.name);
	},
	renderPlayerList:function(game){
		var wrap = $('#player_list'),
			hd = wrap.find('.head'),
			bd = wrap.find('.body'),
			players = game.players,
			maxPlayer = game.maxPlayer;
		
		console.log("updatePlayerList");
		
		var ul = $('<ul />');
		
		for(var i = 0 ,l = players.length ; i < l ; i++){
			var li = $('<li />');
			var player = players[i];
			li.html(player.name);
			ul.append(li);
		}
		
		hd.html(players.length + '/' + maxPlayer);
		bd.empty();
		bd.append(ul);
		
	}
}