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
		var wrap = $('#game_result');
		this.closeGuessView();
		wrap.show();
		function render(cont,list){
			cont.empty();
			list.forEach(function(one){
				var player = $('<div class="player" />'),
					icon = $('<div class="icon" />').addClass('level' + one.level),
					name = $('<div class="name" />').html(one.name);
					
				player.append(icon).append(name);
				cont.append(player)
			});
		}
		
		if(this.started){
			this.started = false;
			render(wrap.find('.winner_list'),obj.winners);
			render(wrap.find('.players'),obj.players);
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
			togo = max - current;
			// unit = togo == 1 ? "player" : "players";
		
		waitingOverlay.html(["还差",togo,"人"].join(" "));	
	},
	resetGuessView:function(){
		var guessview =	$("#guessview");
		this.showHint('平局，请重新出拳');
		guessview.find('.item').show();
	},
	closeGuessView:function(){
		var guessview =	$("#guessview");
		guessview.find('.item').unbind('click');
		guessview.hide();
	},
	renderGuessView:function(me,opp){
		var guessview =	$("#guessview"),
			wrap = $('#wrap'),
			playerA = guessview.find('.playerA'),
			playerB = guessview.find('.playerB');
		
		
		guessview.show();
		guessview.css({
			top:(wrap.outerHeight() - guessview.outerHeight()) / 2,
			left:(wrap.outerWidth() - guessview.outerWidth())/2
		});
		guessview.find('.item').show();
		this.renderPlayerCell(playerA,me);
		this.renderPlayerCell(playerB,opp);
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
	showHint:function(msg){
		var wrap = $('#wrap'),	
			hint = $('#hint');
			
		hint.css({
			top:(wrap.outerHeight() - hint.outerHeight()) / 2,
			left:(wrap.outerWidth() - hint.outerWidth())/2
		});
		
		hint.html(msg);
		hint.fadeIn();
		setTimeout(function(){
			hint.fadeOut();
		},800);
	},
	renderPlayerList:function(winners,players,watchers){
		var wrap = $('#player_list'),
			hd = wrap.find('.head'),
			bd = wrap.find('.body');
		
		var ul = $('<ul />');
		
		
		winners.forEach(function(winner){
			var li = $('<li />').addClass('winner');
			li.html(winner.name + '(已胜出)');
			ul.append(li);	
		});
		
		players.forEach(function(player){
			var li = $('<li />').addClass('player');
			li.html(player.name);
			ul.append(li);
		});
		
		watchers.forEach(function(watcher){
			var li = $('<li />').addClass('watcher');
			li.html(watcher.name + '(观众)');
			ul.append(li);
		});
		
		// hd.html("Player list");
		bd.empty();
		bd.append(ul);
		
	}
}