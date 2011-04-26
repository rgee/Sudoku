(function(){
	function Solver(board){
		// Array of 2d, row-major arrays representing the 3x3 subSquares on the board.
		this.subSquares = [];
		this.proc = board.proc;

		// Board object
		this.board = board;

		// 3d Array repreenting the internal representation of the board, which is an array of potential values an unfilled square could
		// take for each unfilled square.
		this.internalRepr = [];

		// Cached copy of the internal representation from the previous iteration.
		this.lastInternalRepr = [];

		// Set of values from 1-9. Useful in various places.
		this.allSet = new HashSet(function(u){ return u;}, function(u, v){return u === v;});
		this.allSet.addAll([1,2,3,4,5,6,7,8,9]);

		// Array of values from 1-9. Used to limit searchess to specific values.
		this.all = this.allSet.values();

		// The index into the all array for the current value we're using for searches.
		this.currentValueIdx = 0;

		// Flag to indicate the victory message has been displayed once.
		this.solvedMessageDisplayed = false;

		// Flag to indicate if the grid has been changed this iteration.
		this.changedThisIteration = false;

		// Counter for how many consecutive times the board has not been modified.
		this.noChangeCounter = 0;

		// The maximum allowable number of consecutive times the solver can not modify the grid before giving up.
		this.noChangeCutoff = 20;

		// Is the solver solving or not?
		this.active = true;

		// Chance certian calculations will succeed
		this.accuracy = 0.9;

		// A bare minimum for accuracy. I'm not that terrible!
		this.baseAccuracy = 0.7;

		// Stack of the last actions, the number of which determined by maxHistoryLength
		this.actionHistory = [];

		// Number of moves to remember
		this.maxHistoryLength = 5;

		// Current number of actions taken on the grid
		this.actionCounter = 0;
	
		// Number of backtrack attempts		
		this.backtrackCounter = 0;

		// Actions at which we began backtracking.
		this.errorActionCounter = 0;

		// Number of backtracks before we give up trying to correct mistakes.
		this.frustrationWall = 3;

		// Set up the internal representation.
		if(this.board.ready){
			this.processSubSquares();
			this.calculatePotentials();

			// Estimate the difficulty of the board. Not nearly comprehensive, but it's good
			// enough...
			this.startingFillRatio = this.board.numFilled / 81;
		}
		this.adjustAccuracy();

	}

	// Add a convenience function to the array prototype to compare them.
	if(!Array.prototype.compareArrays) {
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
	}

	Solver.prototype = {
		// Run through all knowledge-refinement and square-filling tactics once.
		solve: function(){
			if(this.active){
				this.changedThisIteration = false;

				// Make sure our internal representations are up-to-date.
				this.processSubSquares();
				this.calculatePotentials();

				// Apply strategies
				this.allButOne(this.all[this.currentValueIdx]);
				this.eliminatePairs();
				if(this.startingFillRatio <= 0.2){
					this.eliminateTriples();
				}
				this.takeOpportunities(this.all[this.currentValueIdx]);

				// If we made changes to the grid
				if(!this.changedThisIteration){
					this.noChangeCounter++;
				}else{
					this.noChangeCounter = 0;
				}

				// Have we gone too many iterations without changing the grid?
				if(this.noChangeCounter > this.noChangeCutoff){
					this.errorActionCounter = this.actionCounter;

					// Do we still have the willpower to try again?
					if(this.backtrackCounter < this.frustrationWall){
						this.rollBackActions();
						this.backtrackCounter++;
					} else if(this.actionCounter > this.errorActionCounter){
						this.backtrackCounter = 0;
						this.noChangeCounter = 0;
					} else if(this.backtrackCounter >= this.maxHistoryLength){
						this.active = false;
						Sudoku.log("Tried to correct mistakes, but failed.");
					}else {
						this.active = false;
						Sudoku.log('Went too long without modifying the grid. Stuck.');
					}
				}
				// We're done!
				if(this.solved() && !this.solvedMessageDisplayed){
					Sudoku.log('Puzzle solved.');
					this.solvedMessageDisplayed = true;
					this.active = false;
				}

				this.currentValueIdx = (this.currentValueIdx + 1) % 9;
				this.adjustAccuracy();
			}
		},
		// Stores an action in the solver's memory bank
		logAction: function(action){
			this.actionCounter++;
			if(this.actionHistory.length === this.maxHistoryLength){
				this.actionHistory.shift();
				this.actionHistory.push(action);
			} else {
				this.actionHistory.push(action);
			}
		},
		// Undo every action in the action history. Used to try and correct mistakes.
		rollBackActions: function(){
			Sudoku.log("Backtracking...")
			var lastAction, i = 0;
			while(this.actionHistory.length){
				this.actionCounter--;
				lastAction = this.actionHistory.pop();
				switch(lastAction.type){
					case "INVALID":
						// There's been some erroneous action added. Terminate
						this.active = false;
						Sudoku.log("Invalid action added to history. Cannot revert.");
						return;
						break;
					case "SQUARE_FILLED":
						// Remove the value from the square specified
						this.board.fillSquare(lastAction.data.row, lastAction.data.col, 0);
						break;
					default:
						break;
				}
			}
		},
		// Tweak the accuracy given a rough estimate of the amount of information we're keeping
		// track of.
		adjustAccuracy: function(){	
			this.accuracy = this.baseAccuracy + (this.board.numFilled / 81)*0.959

		},
		// Checks the knowledge base for a possibility list.
		// This function does not always return a correct result. It has a 
		// chance, based on the solver's accuracy to either return the correct result,
		// return the result with an extra (valid) number added, or return the result
		// with a random number removed.
		checkKnowledge: function(row, col){
			if(!this.madeMistake()){
				return this.internalRepr[row][col];
			} else {
				var res = this.internalRepr[row][col];
					res = res.slice(0,res.length);
				if(Math.random() <= 0.5){
					return res.push(Math.floor(Math.random() * 8 + 1));
				}else{
					return res.splice(Math.floor(Math.random() * res.length,1));
				}
			}
		},

		// Returns true if the current configuration is solved. False otherwise.
		solved: function(){
			return  this.rowsValid() &&
					this.columnsValid() 
					this.subSquaresValid();	

		},
		// Returns true if an array of numbers is a permutation of 1 to 9.
		isPermutation: function(numbers){
			if(numbers.length !== 9){
				return false;
			}
			// Use a set to detect duplicates
			var seen = new HashSet(function(u){ return u;}, function(u, v){return u === v;}),
				allPresent = true,
				noDuplicates = true;

			// Check if there are any duplicate numbers
			numbers.forEach(function(e){
				if(seen.contains(e)){
					noDuplicates = false;
				} else {
					seen.add(e);
				}
			});

			// Check if every number in 1...9 is present.
			allPresent = this.allSet.values().every(function(e){
				return seen.contains(e);
			});

			return (allPresent && noDuplicates);
		},
		// Returns true if all the rows in the board are a permutation of 1 to 9.
		rowsValid: function(){
			return this.board.data.every(function(row){
				return this.isPermutation(row);
			},this);			
		},
		// Returns true if all the columns in the board are a permutation of 1 to 9.
		columnsValid: function(){

			// Takes a 2d array and returns a transposed representation of it.
			// Declare the fn in a closure so it isn't created on every invocation.
			var transpose = function(arr){
				var temp,
					result = arr.slice(0, arr.length);
				for(var i = 0; i < 9; i++){
					for(var j = 0; j < 9; j++){
						temp = arr[i][j];
						arr[i][j] = arr[j][i];
						arr[j][i] = temp;
					}
				}
				return result;
			};
			return function(){
				// Rotate the array 90 degrees, then check if the rows are then valid.
				return this.rowsValid(transpose(this.board.data));
			}.call(this);
			
		},
		// Returns true if all the 3x3 subSquares are a permutation of 1 to 9.
		subSquaresValid: function(){
			return this.subSquares.every(function(ss){
				return this.isPermutation(ss);
			},this);
		},

		// Divides the grid into the 3x3 units for constraint testing and stores them in
		// a linear array in row-major order. Each element of subSquares itself is a 2d
		// array representing the subSquare in row-major order.
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
		 // Fill in a square on the grid and update internal representations 
		fillSquare : function(row, col, val){
			this.board.fillSquare(row, col, val);
			this.processSubSquares();
			this.calculatePotentials();
		},

		// Fill a square on the grid if it only has one potential value.
		takeOpportunities : function(value){
			Sudoku.log('*TakeOpportunities*');
			for(var col = 0; col < 9; col++){
				for(var row = 0; row < 9; row++){
					if(this.checkKnowledge(row, col).length === 1 && this.internalRepr[row][col][0] === value){
						this.fillSquare(row,col,value);
						this.changedThisIteration = true;
						this.logAction(new Sudoku.Action("SQUARE_FILLED",new Sudoku.SquareFillData(row, col, value)));
						Sudoku.log('Added ' + value + ' to the board at ('+col+','+row+') by TakeOpportunities.');
					}	
				}

			}
		},

		 // Helper function to do row-major math on the subSquare grid 
		subSquareIdx : function(row,col){
			return (Math.floor(row/3)*3 + Math.floor(col/3));
		},
		inverseSubSquareIdx : function(ssIdx){
			var row = ssIdx % 9,
				col = ssIdx - (row * 9);
			return [row, col];	
		},

		 // Calculate the potential numbers for each grid square, thus creating the solver's internal
		 // representation of the sudoku board. Creates a 3d array of potential numbers from 1-9. 
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
		// Check to see if the solver has just made a mistake. Returns true if it has, false otherwise.
		madeMistake: function(){
			var rand = Math.random();
			if(rand <= this.accuracy){
				return false;	
			}else{
				Sudoku.log('The solver made a mistake!!');
				return true;
			}
		},
		 // Taking each group of three columns or rows (non-overlapping), if a number appears in two of the three subsquares
		 // the group covers, then we know what row or column that number must appear within the final subsquare that does
		 // not have it. Using that, we see if the row or column, within the subgroup without that number only has one square
		 // left unfilled. If so, fill it with that number because we know it could go nowhere else.
		allButOne: function(value){
			Sudoku.log('AllButOne')
			var possibleSubSquares,
				actualSubSquares;

			// Performs the allButOne check on rows.
			for(var rowsStart = 0, rowsEnd = 3; rowsEnd < 9; rowsEnd += 3, rowsStart +=3){
				var rowGroup = [this.board.data[rowsStart],
						        this.board.data[rowsStart + 1],
						        this.board.data[rowsStart + 2]],
				// Map the three rows to an array of pairs representing the coordinates
				// of the given element in the board.
				coords = rowGroup.map(function(elem, index){
					var	row = rowsStart + index,
						col = elem.indexOf(value);

					return [row, col];
				});
				// Only continue if exactly one row did not have the given number assigned.
				if(coords.filter(function(e){
					return (e[1] === -1);
				}).length === 1) {
					// Inaccurate computation. We missed a few squares.
					if(this.madeMistake()){
						return;
					}

					// Grab the coordinate of the row without the value in it.
					var definiteRowCoord = coords.filter(function(e){
						return (e[1] === -1);
					}).map(function(e){
						return e[0];
					})[0];

					// Narrow down which subSquare does not have the value.
					possibleSubSquares = [rowsStart, rowsStart + 1, rowsStart + 2],
					actualSubSquares = coords.filter(function(e){
						return e[1] !== -1;
					}).map(function(e){
						return this.subSquareIdx(e[0], e[1]);
					}, this);

					// Filter out everything but the subSquare without the number assigned.
					actualSubSquares = possibleSubSquares.filter(function(e){
						return actualSubSquares.indexOf(e) === -1;
					})[0];

					// Extract the segment of the row the value could be placed into.
					var rowSegment = this.board.data[definiteRowCoord].slice(actualSubSquares*3, actualSubSquares*3 + 3);

					// If there's only one empty slot, the value must be placed there.
					if(rowSegment.filter(function(e){
						return e === 0;
					}).length === 1){
						if(this.madeMistake()){
							return;
						}
						var definiteColCoord = (actualSubSquares * 3) + rowSegment.indexOf(0);
						this.fillSquare(definiteRowCoord, definiteColCoord,value);
						this.changedThisIteration = true;
						Sudoku.log('Added ' + value + ' to the board at ('+definiteColCoord+','+definiteRowCoord+') using AllButOne.');
					}
				}
			}

			// Perform the all but one check on groups of columns...eugh.
			for(var colsStart = 0, colsEnd = 3; colsEnd < 9; colsEnd += 3, colsStart += 3){
				var colGroup = [this.board.getColumn(colsStart),
					            this.board.getColumn(colsStart + 1),
					            this.board.getColumn(colsStart + 2)];
				coords = colGroup.map(function(elem, index){
					var row = elem.indexOf(value),
						col = colsStart + index;
					return [row, col];
				});
				if(coords.filter(function(e){
					return (e[0] === -1);
				}).length === 1){
					var definiteColCoord = coords.filter(function(e){
						return (e[0] === -1);
					}).map(function(e){
						return e[1];
					})[0];

					possibleSubSquares = [colsStart, colsStart + 1, colsStart +2].map(function(e){return e*3;}),
					actualSubSquares = coords.filter(function(e){
							return e[0] !== -1;
						}).map(function(e){
							return this.subSquareIdx(e[0], e[1]);
						}, this);

					actualSubSquares = possibleSubSquares.filter(function(e){
						return actualSubSquares.indexOf(e) === -1;
					})[0];

					var colSegment = this.board.getColumn(definiteColCoord).slice(actualSubSquares, actualSubSquares + 3);

					if(colSegment.filter(function(e){
						return e === 0;
					}).length === 1){
						var definiteRowCoord = actualSubSquares + colSegment.indexOf(0);
						this.fillSquare(definiteRowCoord, definiteColCoord, value);
						Sudoku.log('Added ' + value + ' to the board at ('+definiteColCoord+','+definiteRowCoord+') using AllButOne.');
					}
				}
			}
		},
		eliminatePairs: function(){
			Sudoku.log('*EliminatePairs*')
			this.eliminateGroups(2);	
		},
		eliminateTriples: function(){
			Sudoku.log('*EliminateTriples*');
			this.eliminateGroups(3);	
		},
		// If, along a row or a column, a length (either two or three) number of cells share a common, length
		// long possibility list, then we know the values in the possibility list MUST be placed in those two
		// cells, so we can remove them as possibilities from cells in that row or column.
		eliminateGroups: function(length){
			var elem = temp = removed = numMatches = null;
			numMatches = 0;
			for(var row = 0; row < 9; row++){
				for(var col = 0; col < 9; col++){
					elem = this.internalRepr[row][col].slice(0);
					if(elem.length === length){
						// ****ROW CONSTRAINTS**** 
						// Make a copy of the array to mutate.
						temp = this.internalRepr[row].slice(0);

						// Check if it's identical to any other pairs in the row after removing it from the array.
						removed = false;
						temp = temp.filter(function(element, index, array){
							if(elem.compareArrays(element) && !removed){
								removed = true;
								return false;
							} else {
								
								return true;
							}
						});
						
						// Does enough of these exist in the row?
						other = false;
						$.each(temp, function(index, val){
							if(elem.compareArrays(val)){
								numMatches++;
							}
						});
						if(numMatches === length-1){
							numMatches = 0;
							// Remove every instance of the pair from all its supersets in the row.
							this.internalRepr[row] = $.map(this.internalRepr[row], function(element, index){
								if(elem.compareArrays(element)){
									return [element];
								} else {
									var t= element.filter(function(e, i, a){
										var result = true;
										for(var i = 0; i < elem.length; i++){
											if(elem[i] === e){
												Sudoku.log('Eliminated ' + e + ' from ' + '(' + row + ',' + index + ')s possibility list in the knowledge base.');
												result = false;
												break;
											}
										}
										return result;
									});
									return [t];
								}
							});
						}

						// ****COLUMN CONSTRAINTS**** 
						for(var i = 0; i < 9; i++){
							if(elem.compareArrays(this.internalRepr[i][col]) && i !== row){
								numMatches++;
							}
						}

						if(numMatches === length-1){
							for(var i = 0; i < 9; i++){
								if(!elem.compareArrays(this.internalRepr[i][col])){
									this.internalRepr[i][col] = this.internalRepr[i][col].filter(function(e, index, arr){
										var result = true;
										for(var i = 0; i < elem.length; i++){
											if(elem[i] === e){
												Sudoku.log('Eliminated ' + e + ' from ' + '(' + col + ',' + index + ')s possibility list in the knowledge base.');
												result = false;
												break;
											}
										}
										return result;
									});
								}
							}
						}
					}
				} 
			}
		}
	};

    Sudoku.Solver = Solver;
})();
