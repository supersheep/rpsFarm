var gameClient = {
	started:false,
	start:function(){
		if(!this.started){
			this.started = true;
			$("#waiting").hide();
			$('#board').show();
		}
	},
	end:function(obj){
		var winners,players;
		if(this.started){
			this.started = false;
			winners = obj.winners;
			players = obj.players;
			console.log(winners,players);
		}
	},
	
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
				var nametip = $('<div class="tip" />').html(name);
				var grid = $('<div class="grid ' + level + '" />');
				grid.append(nametip);
				row.append(grid);
			}
			board.append(row);
		}
	},
	waitPlayer:function(max,current){
		var waitingOverlay = $('#waiting');
		waitingOverlay.html("还差" + (max - current) + "人...");	
	},
	resetGuessView:function(){
		var guessview =	$("#guessview");
		guessview.find('.item').show();
	},
	closeGuessView:function(){
		var guessview =	$("#guessview");
		guessview.hide();
	},
	renderGuessView:function(me,opp){
		var guessview =	$("#guessview");
		guessview.show();
		guessview.find('.playerA').html(me.name);
		guessview.find('.playerB').html(opp.name);
		guessview.find('.item').show();
	},
	bindGuessView:function(player,guess){
		var guessview = $("#guessview");
		
		guessview.find('.item').on('click',function(e){
			var el = $(this),
				action = el.attr('class').split(' ')[1].toUpperCase();
				
			guessview.find('.item').hide();
			el.show();
			
			socket.emit("guess act",{
				player:player,
				guess:guess,
				action:action
			});
		});
	},
	
	renderPlayerList:function(players,watchers,maxPlayer){
		var wrap = $('#player_list'),
			hd = wrap.find('.head'),
			bd = wrap.find('.body');
		
		var ul = $('<ul />');
		
		players.forEach(function(player){
			var li = $('<li />');
			li.html(player.name);
			ul.append(li);
		});
		
		watchers.forEach(function(watcher){
			var li = $('<li />').addClass('watcher');
			li.html(watcher.name + '(观众)');
			ul.append(li);
		});
		
		hd.html(players.length + '/' + maxPlayer);
		bd.empty();
		bd.append(ul);
		
	}
}