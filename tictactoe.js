~function(){

	var PLAYER = 'o',
		AI = 'x';

	var $board,
		$reset,
		turn = PLAYER,
		gameover = false,
		paths = [[[0,0],[1,1],[2,2]],
				 [[0,2],[1,1],[2,0]],
				 [[0,0],[0,1],[0,2]],
				 [[1,0],[1,1],[1,2]],
				 [[2,0],[2,1],[2,2]],
				 [[0,0],[1,0],[2,0]],
				 [[0,1],[1,1],[2,1]],
				 [[0,2],[1,2],[2,2]]],
		board = [[ null, null, null ],
				 [ null, null, null ],
				 [ null, null, null ]];

	// occupy a cell with the specified player's livery
	var setCell = function( position, player ){
		board[ position[0] ][ position[1] ] = player;
		var $cell = $board.find('tr:eq('+ position[0] +') > td:eq('+ position[1] +')');
		$cell.html( player ).addClass( player );
	};

	// start the next turn
	var nextTurn = function(){
		var status = checkStatus();
		turn = ( turn === AI )? PLAYER: AI;
		if( turn === AI ){
			aiMove();
		}
	};

	// do the next step in the game
	var checkStatus = function(){
		var possible_ai_scores = findScoringPaths( AI );
		var possible_player_scores = findScoringPaths( PLAYER );
		var ai_scores = findScoringPaths( AI, 3 );
		var player_scores = findScoringPaths( PLAYER, 3 );
		if( ai_scores.length > 0 ){
			endGame( 'victory', AI );
			return false;
		}
		else if( player_scores.length > 0 ){
			endGame( 'victory', PLAYER );
			return false;
		}
		else if( possible_ai_scores.length + possible_player_scores.length === 0 ){
			endGame('draw');
			return false;
		}
		return true;
	};

	// display an endgame message and update game status
	var endGame = function( status, player ){
		if( status === 'victory' ){
			alert( player +' is victorious!' );
		}
		else if( status === 'draw' ){
			alert( PLAYER +' and '+ AI +' failed to best one another' );
		}
		gameover = true;
	};

	// a simple, brutish AI move
	var aiMove = function(){
		// find scoring paths, weight
		var possible_scores = findScoringPaths( AI );
		var imminent_scores = $.grep( possible_scores, function( path, i ){
			return path.score === 2;
		});
		// find enemy scoring paths, weight
		var possible_opponent_scores = findScoringPaths( PLAYER );
		var imminent_opponent_scores = $.grep( possible_opponent_scores, function( path, i ){
			return path.score === 2;
		});

		if( !board[1][1] ){
			setCell( [1,1], AI );
		}
		else if( imminent_scores.length > 0 ){
			var cell = firstEmptyCell( imminent_scores[0].path );
			setCell( cell, AI );
		}
		else if( imminent_opponent_scores.length > 0 ){
			var cell = firstEmptyCell( imminent_opponent_scores[0].path );
			setCell( cell, AI );
		}
		else {
			var cell = firstEmptyCell( possible_opponent_scores[0].path );
			setCell( cell, AI );
		}
		// initiate the next turn
		nextTurn();
	};

	// find possible scoring paths for specified player
	// sort scoring paths by score
	// limit scoring paths to a certain score
	var findScoringPaths = function( player, minscore ){
		minscore = minscore || 0;
		var possible_scores = [],
			opponent = ( player === PLAYER )? AI: PLAYER;
		for( var i in paths ){
			var path = paths[i],
				score = 0,
				blocked = false;
			for( var ii in path ){
				var cell = board[ path[ii][0] ][ path[ii][1] ];
				if( cell === opponent ){
					blocked = true;
					break;
				}
				else if( cell === player ){
					score++;
				}
			}
			if( !blocked && score >= minscore ){
				possible_scores.push({
					path: path,
					score: score
				});
			}
		}
		// sort paths by score chance
		possible_scores.sort( function( a, b ){
			return b.score - a.score;
		});
		return possible_scores;
	};

	// find the first empty cell in a path
	var firstEmptyCell = function( path ){
		var cell;
		for( var i in path ){
			if( !board[ path[i][0] ][ path[i][1] ] ){
				cell = path[i];
				break;
			}
		}
		return cell;
	};

	// reset the status of the game
	var reset = function(){
		board = [[ null, null, null ],
				 [ null, null, null ],
				 [ null, null, null ]];
		$board.find('td').removeClass('x o').html('');
		gameover = false;
	};

	// simple bindings to make the game work
	$(function(){

		$board = $('#board');
		$reset = $('#reset');

		$board.on( 'click', 'td:not(.x,.o)', function( e ){
			
			if( gameover ) return;

			var $cell = $(this);
			var $row = $cell.parent();
			var position = [ $row.index(), $cell.index() ];

			// set square
			setCell( position, PLAYER );

			// use turn
			nextTurn();

		});

		$reset.on( 'click', reset );

	});

}();