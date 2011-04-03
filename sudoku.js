function displayError(text){
	var errorDiv = $('#errors');
	var result = $('#errortext')
					.html(text)
					.css({"visibility":"visible"})
					.appendTo(errorDiv);
	
}

function draw(proc){
	proc.selectedRow = 0;
	proc.selectedCol = 0;
	proc.keyboardMode = false;

	proc.mousePressed = function(){
		this.selectedCol = Math.floor((9 * (this.mouseY / this.height)));
		this.selectedRow = Math.floor((9 * (this.mouseX / this.width)));
		this.keyboardMode = true;
	};
	
	proc.keyPressed = function() {
		if(this.keyboardMode){
			var str = String.fromCharCode(this.key);
			if(!(/\D/.test(str))){
				gameBoard.fillSquare(this.selectedRow, this.selectedCol, str);	
				solver.processSubSquares();
			}
			this.keyboardMode = false;
				
		}
		
	};
	
	proc.setup = function() {
	
	};
	
	proc.drawSelected = function() {
		this.fill(204, 102, 0);
		this.rect(this.selectedCol * (this.width / 9), this.selectedRow * (this.height / 9),
			(this.width / 9), (this.height / 9));
	};
	
	proc.drawText = function() {
		context.font = 'italic 15px sans-serif';
		context.fillStyle = '#000';
	
		for(var y = 0; y < 9; y++){
			for(var x = 0; x < 9; x++){
				if(gameBoard.data[x][y]) {
					context.fillText(gameBoard.data[x][y], y * (this.height / 9) + (this.height / 18),
														   x * (this.width / 9) + (this.width / 18));
				}
			}
		}
	};
	
	proc.draw = function(){
		this.background(150);
		this.fill = 245;
		this.stroke = 0;
		this.rect(0, 0, this.width, this.height);
		
		var i = 0, j = 0;
		while(i < this.height && j < this.width){
			this.line(0, i, this.width, i);
			this.line(j, 0, j, this.height);
			i += this.height / 9;
			j += this.width / 9;
		}

		this.drawText();
		
	};
}


function startSolve(){
	var solve = (function(){
		var i = 0;
		return function(){
			i = i +1;
			term.put("Solver iteration: " + i);
		};
	})();

	if(gameBoard.ready){
		setInterval(function(){
			solve();
		}, 1000);
	}else{
		displayError("Game board not initialized. Enter at least one number.");
	}
}


(function(global){
	var defaultEasyBoard = [[5,0,8,0,4,1,6,0,0],
						    [0,6,0,8,0,9,0,0,0],
						    [1,0,0,6,0,0,5,4,0],
						    [9,0,0,1,6,0,7,0,0],
						    [0,0,0,5,7,2,0,0,0],
						    [0,0,5,0,3,4,0,0,6],
						    [0,1,4,0,0,5,0,0,2],
						    [0,0,0,2,0,6,0,5,0],
						    [0,0,6,4,8,0,3,0,9]];

	function Board(defaultConfig){
		this.ready = false;
		if(defaultConfig !== undefined){
			this.data = defaultEasyBoard;
			this.ready = true;
		}else{
			this.data = new Array(9);
			for(var i = 0; i < 9; i++){
				this.data[i] = new Array(9);
				for(var j = 0; j < 9; j++){
					this.data[i][j] = 0;
				}
			}
		}
		console.log(this.data);
	}

	Board.prototype = {
		fillSquare : function(row, col, val) {
			this.data[row][col] = val;
			if(!this.ready){
				this.ready = true;
			}
		}
	};

	// Make a new board and expose it.
	// Usage: call 'GameBoard()' to get a new game board object.
	var gameBoard = function(defaultConfig){
		return new Board(defaultConfig);	
	};
	window.GameBoard = gameBoard;
})(window);

(function(global){
	function Solver(board){
		/* Binary max heap of sub-square objects. Sub-squares have an index
		   representing their position on the board and an array of their filled
		   numbers. The scoring function for the heap is the length of this array.

		   The idea is that I always look for the most complete subsquares
		   first when trying to find trivial solutions like a subsquare with 8 cells
		   filled.
		*/
		this.subSquareHeap = new BinHeap(function(u){return u.data.length;});
	}

	Solver.prototype = {
		/* Run through all knowledge-refinement and square-filling tactics once. */
		solve: function(){
		},
		processSubSquares: function(){
			this.subSquareHeap.clear();
			var row = 0;
			for(var col = 0; col < 3; col++){
				for(var row = 0; row < 3; row++){
					var data = new Array();
					for(var x = 0; x < 3; ++x){
						for(var y = 0; y < 3; ++y){
							var current = gameBoard.data[(row*3) + y][(col*3) + x];
							if(current) {
								data.push(current);
							}
						}
					}
					var subObj = {'idx' : [col,row],
								  'data' : data};
					this.subSquareHeap.push(subObj);
				}
				
			}
			console.log(this.subSquareHeap);
		},
		/* Fill in a square on the grid and update internal representations */
		fillSquare : function(row, col, val){
			this.processSubSquares();
		}
	};
	var solver = function(board){
		return new Solver(board);
	}
	window.Solver = solver;
})(window)


/* Globals */
var term = {};
var context = {};
var solver = new Solver();
var gameBoard = {};

jQuery(document).ready(function(){
	term = new Terminal('.terminal', 450, 385);
	$('.terminal').click(function(){ term.put('(right <= length && this.scorer(this.data[right]) > this.scorer(this.data[largest))'); });
	$('#start').click(startSolve);
	gameBoard = GameBoard(true)
	term.put(gameBoard.data);
	
	var procInstance = new Processing(document.getElementById('board'), draw);
	procInstance.size(400,400);
	context = document.getElementById('board').getContext('2d');
	
	
	solver.processSubSquares();
}); 