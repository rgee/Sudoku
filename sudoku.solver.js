(function(){
	function Solver(board, proc){
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

		this.allSet = new HashSet(function(u){ return u;}, function(u, v){return u === v;});
		this.allSet.addAll([1,2,3,4,5,6,7,8,9]);

		this.strategies = [];
		this.strategies.push(this.allButOne, this.eliminatePairs, this.eliminateTriples,  this.takeOpportunities);
		this.currentStrategy = 0;

		// Set up the internal representation.
		if(this.board.ready){
			this.processSubSquares();
			this.calculatePotentials();
		}
		this.solvedMessageDisplayed = false;
	}


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
			// Make sure our internal representations are up-to-date.
			this.processSubSquares();
			this.calculatePotentials();

			this.allButOne();
			this.eliminatePairs();
			this.eliminateTriples();
			this.takeOpportunities();

			if(this.solved() && !this.solvedMessageDisplayed){
				console.log('Puzzle solved.');
				this.solvedMessageDisplayed = true;
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

		 // Analyze both the internal state and previous state and generate a summary of changes
		 // in the form of an array of strings, each representing a single change.
		summarizeChanges : function(){
			
		},
		 // Fill in a square on the grid and update internal representations 
		fillSquare : function(row, col, val){
			this.board.fillSquare(row, col, val);
			this.processSubSquares();
			this.calculatePotentials();
		},

		// Fill a square on the grid if it only has one potential value.
		takeOpportunities : function(){

			for(var col = 0; col < 9; col++){
				for(var row = 0; row < 9; row++){
					if(this.internalRepr[row][col].length == 1){
						this.fillSquare(row,col,this.internalRepr[row][col][0]);
						console.log('Added ' + '('+col+','+row+') to the board because it had no other options.');
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

		 // If a number is only a candidate in one row or column of a 3x3 subsquare, we can remove it as a candidate
		 // from all cells in that particular row or column. It must appear in that particular subsquare or else
		 // that subsquare would have no other way of filling the number.
		onlyCandidate: function(){
			var all = [1,2,3,4,5,6,7,8,9],
				thisRow = [],
				numOccurrences = 0,
				location = 0;
			all.forEach(function(number){


				// Iterate through the potential 3d array by subsquare


				// [0,1,2,3,4,5,6,7,8].forEach(function(row, index){
				// 	thisRow = this.internalRepr[row];

				// 	// Flatten the potential arrays in this row, and count number of appearances of the given number.
				// 	numOccurrences = thisRow.reduce(function(a,b){
				// 			return a.concat(b);
				// 		})
				// 		.map(function(e){
				// 			return (a === number ? 1 : 0);	
				// 		})
				// 		.reduce(function(prev, curr){
				// 			return prev + curr;
				// 		});
				// 	if(numOccurrences === 1){
				// 		thisRow.forEach(function(e, index){
				// 			if(e.indexOf(number) !== -1){
				// 				location = index;
				// 			}
				// 		});
				// 		thisRow.map(function(e, index){
				// 			return (index === location ? e :
				// 										 e.sli)
				// 		})
				// 	}

				// },this);
			},this);

		},
		 // Taking each group of three columns or rows (non-overlapping), if a number appears in two of the three subsquares
		 // the group covers, then we know what row or column that number must appear within the final subsquare that does
		 // not have it. Using that, we see if the row or column, within the subgroup without that number only has one square
		 // left unfilled. If so, fill it with that number because we know it could go nowhere else.
		allButOne: function(){
			var all = [1,2,3,4,5,6,7,8,9],
				possibleSubSquares,
				actualSubSquares;

			all.forEach(function(value){
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
							var definiteColCoord = (actualSubSquares * 3) + rowSegment.indexOf(0);
							this.fillSquare(definiteRowCoord, definiteColCoord,value);
							console.log('Added ' + value + ' to the board at ('+definiteColCoord+','+definiteRowCoord+') using AllButOne.');
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
							console.log('Added ' + value + ' to the board at ('+definiteColCoord+','+definiteRowCoord+') using AllButOne.');
						}
					}
				}
			},this);
		},
		eliminatePairs: function(){
			this.eliminateGroups(2);	
		},
		eliminateTriples: function(){
			this.eliminateGroups(3);	
		},
		eliminateGroups: function(length){

			var elem = temp = removed = numMatches = null;
			numMatches = 0;
			for(var row = 0; row < 9; row++){
				for(var col = 0; col < 9; col++){
					elem = this.internalRepr[row][col].slice(0);
					if(elem.length === length){
						/* ****ROW CONSTRAINTS**** */
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
												console.log('Eliminated ' + e + ' from ' + '(' + row + ',' + index + ')s possibility list in the knowledge base.');
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

						/* ****COLUMN CONSTRAINTS**** */
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
												console.log('Eliminated ' + e + ' from ' + '(' + col + ',' + index + ')s possibility list in the knowledge base.');
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
