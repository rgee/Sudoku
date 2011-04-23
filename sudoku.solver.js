(function(){
	function Solver(board){
		// Array of 2d, row-major arrays representing the 3x3 subSquares on the board.
		this.subSquares = [];

		// Board object
		this.board = board;

		// 3d Array repreenting the internal representation of the board, which is an array of potential values an unfilled square could
		// take for each unfilled square.
		this.internalRepr = [];

		// Cached copy of the internal representation from the previous iteration.
		this.lastInternalRepr = [];

		// Set up the internal representation.
		this.processSubSquares();
		this.calculatePotentials();
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
			this.processSubSquares();
			this.calculatePotentials();

			this.eliminatePairs();
			this.eliminateTriples();
			this.takeOpportunities();
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
			var all = [1,2,3,4,5,6,7,8,9];
			all.forEach(function(val){
				// Check rows of subSquares.
				for(var startIdx = 0, endIdx = 3; endIdx < 9; startIdx +=3, endIdx += 3){
					// The current group of subsquares we're comparing
					var workingSet = this.subSquares.slice(startIdx, endIdx),
					// Map the subSquares to the positions of the given number, -1 if not there.
					occupancy = workingSet.map(function(elem){
						var idx = elem.indexOf(val);
						return idx;
					}),
					// Count how many subSquares have the given number already placed.
					howMany = occupancy.reduce(function(prev, curr){
						return prev + (curr === -1 ? 0 : 1);
					});

					// If we can determine the given number can only fit in one of the three rows.
					if(howMany === 2){
						// The subSquare missing the current number.
						var subSquareToFill = this.subSquares[occupancy.indexOf(-1)];

						// If there's only one empty square in this subSquare.
						if(subSquareToFill.filter(function(elem){
								return elem === 0;
							}).length === 1){
							var	rows = occupancy.map(function(elem){
									return this.inverseSubSquareIdx(elem)[0];
								},this),
								// Deduce which row doesn't have the number placed.
								placementRow = [startIdx, startIdx + 1, startIdx +2].filter(function(elem){
									return (rows.indexOf(elem) === -1);
								}),
								// Deduce which column is the empty one in the target subSquare.
								placementCol = this.inverseSubSquareIdx(this.subSquares.indexOf(subSquareToFill) + subSquareToFill.indexOf(0))[1];
							this.fillSquare(placementRow, placementCol,val)
						}
							 
					}
				}

				// Check columns of subSquares.
			}, this);
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
									this.internalRepr[i][col] = this.internalRepr[i][col].filter(function(e, idx, arr){
										var result = true;
										for(var i = 0; i < elem.length; i++){
											if(elem[i] === e){
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
