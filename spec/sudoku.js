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
		this.subSquares = [];
		this.board = board;
		this.processSubSquares();
		this.calculatePotentials();
	}

	Solver.prototype = {
		/* Run through all knowledge-refinement and square-filling tactics once. */
		solve: function(){

		},

		/* Divides the grid into the 3x3 units for constraint testing and stores them in
		   a linear array in row-major order. Each element of subSquares itself is a 2d
		   array representing the subSquare in row-major order. */
		processSubSquares: function(){
			this.subSquares = [];
			var row = 0;
			for(var col = 0; col < 9; col+=3){
				for(var row = 0; row < 9; row+=3){
					var data = new Array();
					for(var x = 0; x < 3; ++x){
						for(var y = 0; y < 3; ++y){
							data.push(this.board.data[col + x][row + y]);
						}
					}
					this.subSquares.push(data);
				}
				
			}
		},

		/* Fill in a square on the grid and update internal representations */
		fillSquare : function(row, col, val){
			this.processSubSquares();
			this.internalRepr[row][col] = [];
		},

		/* Helper function to do row-major math on the subSquare grid */
		subSquareIdx : function(row,col){
			return (Math.floor(row/3)*3 + Math.floor(col/3));
		},

		/* Calculate the potential numbers for each grid square, thus creating the solver's internal
		   representation of the sudoku board. Creates a 3d array of potential numbers from 1-9.
		 */ 
		calculatePotentials : function(){
			var all = [1,2,3,4,5,6,7,8,9];

			this.internalRepr = new Array(9);
			for(var row = 0; row < 9; row++){
				this.internalRepr[row] = new Array(9);
				for(var col = 0; col < 9; col++){
					// Calculate possible numbers based on row/col/subsquare constraints if not given.
					if(!this.board.data[row][col]){
						 var subSquareIdx = this.subSquareIdx(row,col);
						 var possibilities = all.slice(0);
						 for(var i = 0; i < all.length; i++){
						 	var result = true;
					 		if(this.board.data[row].indexOf(all[i]) !== -1){
					 			result = false;
					 		}
					 		for(var j = 0; j < 9; j++){
					 			if(this.board.data[j][col] === all[i]){
					 				result = false;
					 				break;
					 			}
					 		}

					 		if(this.subSquares[subSquareIdx].indexOf(all[i]) !== -1 ){
					 			result = false;
					 		}
					 		if(!result){
					 			possibilities.splice(possibilities.indexOf(all[i]),1);
					 		}
						 }
						 this.internalRepr[row][col] = possibilities;
					} else {
						this.internalRepr[row][col] = [];
					}
				}
			}
		},
		eliminatePairs: function(){
			var elem = temp = other = null;
			for(var row = 0; row < 9; row++){
				for(var col = 0; col < 9; col++){
					elem = this.internalRepr[row][col].slice(0);
					if(elem.length === 2){
						temp = this.internalRepr[row].slice(0);
						// Check if it's identical to any other pairs after removing it from the array.
						other = temp.splice(temp.indexOf(elem),1).indexOf(elem);
						if(other !== -1){
							// Remove every instance of the pair from all its supersets in the row.
							$.map(this.internalRepr[row], function(element, index){
								return $.map(element, function(e, i){
									for(var k = 0; k < 2; k++){
										if(e === elem[k]){
											return null;
										}
									}
								});
							});
						}
					}
				} 
			}
		},
		eliminateTriples: function(){
			
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
var solver = {};
var gameBoard = {};


/* Helper function meant to build-in support for higher-order functions on arrays
   in browsers that do not support Javascript 1.6. Code provided free from the Mozilla
   Developer Network JS documentation page at:
   https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array
 */
function setupWorkarounds(){
	
	if (!Array.prototype.map)
	{
	  Array.prototype.map = function(fun /*, thisp */)
	  {
	    "use strict";

	    if (this === void 0 || this === null)
	      throw new TypeError();

	    var t = Object(this);
	    var len = t.length >>> 0;
	    if (typeof fun !== "function")
	      throw new TypeError();

	    var res = new Array(len);
	    var thisp = arguments[1];
	    for (var i = 0; i < len; i++)
	    {
	      if (i in t)
	        res[i] = fun.call(thisp, t[i], i, t);
	    }

	    return res;
	  };
	}

	if (!Array.prototype.filter)
	{
	  Array.prototype.filter = function(fun /*, thisp */)
	  {
	    "use strict";

	    if (this === void 0 || this === null)
	      throw new TypeError();

	    var t = Object(this);
	    var len = t.length >>> 0;
	    if (typeof fun !== "function")
	      throw new TypeError();

	    var res = [];
	    var thisp = arguments[1];
	    for (var i = 0; i < len; i++)
	    {
	      if (i in t)
	      {
	        var val = t[i]; // in case fun mutates this
	        if (fun.call(thisp, val, i, t))
	          res.push(val);
	      }
	    }

	    return res;
	  };
	}
}

Context("sudoku solving",
	setup(function(){
		var slv = Solver(GameBoard());
	}),
	Context("finding pairs",
		setup(function(){
			slv.internalRepr = [[[2,3],[2,3],[2,3,7],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]]];
			var target = [[[2,3],[2,3],[7],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]]];
		}),
		should("remove pairs from the potential lists if they exist", function(){
			slv.eliminatePairs();
			console.log(slv.internalRepr);
			assert.equal(slv.internalRepr, target);
		})

	)
);
Tests.run();

jQuery(document).ready(function(){

	setupWorkarounds();



	term = new Terminal('.terminal', 450, 385);
	$('.terminal').click(function(){ term.put('(right <= length && this.scorer(this.data[right]) > this.scorer(this.data[largest))'); });
	$('#start').click(startSolve);
	gameBoard = GameBoard(true)
	term.put(gameBoard.data);
	
	var procInstance = new Processing(document.getElementById('board'), draw);
	procInstance.size(400,400);
	context = document.getElementById('board').getContext('2d');
	
	solver = Solver(gameBoard);
}); 



