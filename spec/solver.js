 Array.prototype.compareArrays = function(arr) {
    if (this.length != arr.length) return false;
    for (var i = 0; i < arr.length; i++) {
        if (this[i].compareArrays) { //likely nested array
            if (!this[i].compareArrays(arr[i])) return false;
            else continue;
        }
        if (this[i] != arr[i]) return false;
    }
    return true;
};

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
			var elem = temp = other = removed = null;

			for(var row = 0; row < 9; row++){
				for(var col = 0; col < 9; col++){
					elem = this.internalRepr[row][col].slice(0);
					if(elem.length === 2){
						// Make a copy of the array to mutate.
						temp = this.internalRepr[row].slice(0);

						// Check if it's identical to any other pairs after removing it from the array.
						removed = false;
						temp = temp.filter(function(element, index, array){
							if(elem.compareArrays(element) && !removed){
								removed = true;
								return false;
							} else {
								
								return true;
							}
						});
						
						// Does another of this type exist?
						other = false;
						$.each(temp, function(index, val){
							if(elem.compareArrays(val)){
								other = true;
								return false;
							}
						});
						if(other){
							// Remove every instance of the pair from all its supersets in the row.
							this.internalRepr[row] = $.map(this.internalRepr[row], function(element, index){
								if(elem.compareArrays(element)){
									return [element];
								} else {
									var t= element.filter(function(e, i, a){
										return !(e === elem[0] || e === elem[1]);
									});
									return [t];
								}
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