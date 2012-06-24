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
	message:function(from,msg){
		var msgbox = $('#msgbox'),
			bd = msgbox.find('.body');
			msg = from == "sys" ? ("info:" + msg) : msg;
		
		var li = $('<div class="msg" />').html(msg);
		li.addClass(from);
		bd.prepend(li);
	},
	renderPlayerCell:function(wrap,player){
		var level = player ? "level" + player.level : "",
			nametip = $('<div class="tip" />').html(player.name),
			pblock = $('<div />').addClass(level + " icon").append(nametip);

		wrap.addClass('player');
		wrap.empty();
		wrap.append(pblock);
	},
	renderView:function(matrix){
		var board = $('#board');
			
		board.empty();
		for(var i = 0 , l = matrix.length ; i < l ; i++){
			var row = $('<div class="row" />');
			var rowdata = matrix[i];
			for(var j = 0,m=rowdata.length ; j < m ; j++){
				var player = rowdata[j],
					grid = $('<div class="grid" />');
				
				
				player && this.renderPlayerCell(grid,player);
				row.append(grid);
			}
			board.append(row);
		}
	},
	waitPlayer:function(max,current){
		var waitingOverlay = $('#waiting'),
			togo = max - current,
			unit = togo == 1 ? "player" : "players";
		
		waitingOverlay.html([togo,unit,"to go"].join(" "));	
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
		var guessview =	$("#guessview"),
			playerA = guessview.find('.playerA'),
			playerB = guessview.find('.playerB');
			
		guessview.show();
		this.renderPlayerCell(playerA,me);
		this.renderPlayerCell(playerB,opp);
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
	
	renderPlayerList:function(winners,players,watchers){
		var wrap = $('#player_list'),
			hd = wrap.find('.head'),
			bd = wrap.find('.body');
		
		var ul = $('<ul />');
		
		
		winners.forEach(function(winner){
			var li = $('<li />').addClass('winner');
			li.html(winner.name + '(won)');
			ul.append(li);	
		});
		
		players.forEach(function(player){
			var li = $('<li />').addClass('player');
			li.html(player.name);
			ul.append(li);
		});
		
		watchers.forEach(function(watcher){
			var li = $('<li />').addClass('watcher');
			li.html(watcher.name + '(watcher)');
			ul.append(li);
		});
		
		// hd.html("Player list");
		bd.empty();
		bd.append(ul);
		
	}
}