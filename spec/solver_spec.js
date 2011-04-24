describe('solver', function(){
	var slv, brd;
	beforeEach(function(){
		brd = new Sudoku.Board(true);
		slv = new Sudoku.Solver(brd);
	});
	describe('#getColumn', function(){
		beforeEach(function(){
			brd.data = [[0,0,3,8,1,0,6,7,0],
                        [7,0,0,6,4,0,0,0,3],
                        [0,9,0,0,0,3,0,0,0],
                        [3,0,0,7,0,0,0,1,4],
                        [0,0,0,0,0,0,0,0,0],
                        [1,7,0,0,0,6,0,0,5],
                        [0,0,0,2,0,0,0,5,0],
                        [8,0,0,0,9,5,0,0,6],
                        [0,2,5,0,8,1,3,0,0]];
		});
		it('extracts the third column', function(){
			var target = [3,0,0,0,0,0,0,0,5];
			expect(brd.getColumn(2)).toArrayEq(target);
		});

	});
	describe('#isPermutation', function(){
		it("correctly determines that [1,5,2,4,3,6,9,7,8] is a permutation of [1,2,3,4,5,6,7,8,9]", function(){
			expect(slv.isPermutation([2,8,4,6,3,5,1,7,9])).toEqual(true);
		});
		it("correctly determines that [1,2,3,4,5,5,6,7,8,9] is not a permutation of [1,2,3,4,5,6,7,8,9]", function(){
			expect(slv.isPermutation([1,2,3,4,5,5,6,7,8,9])).toEqual(false);
		});
	});
	describe('#solved', function(){
		describe('a correct board configuration', function(){
			beforeEach(function(){
				slv.board.data = [[5,3,4, 6,7,8, 9,1,2],
								  [6,7,2, 1,9,5, 3,4,8],
								  [1,9,8, 3,4,2, 5,6,7],

								  [8,5,9, 7,6,1, 4,2,3],
								  [4,2,6, 8,5,3, 7,9,1],
								  [7,1,3, 9,2,4, 8,5,6],

								  [9,6,1, 5,3,7, 2,8,4],
								  [2,8,7, 4,1,9, 6,3,5],
								  [3,4,5, 2,8,6, 1,7,9]];
				slv.processSubSquares();
			});
			it('determines that the board is solved', function(){
				expect(slv.solved()).toEqual(true);
			});
		});
		describe('an incorrect board configuration', function(){
			beforeEach(function(){
				slv.board.data = [[5,4,3,8,1,2,6,7,9],
								  [7,8,1,6,4,9,5,2,3],
								  [2,6,9,5,7,3,4,8,1],
								  [3,6,2,7,5,8,9,1,4],
								  [9,5,8,1,3,4,7,6,2],
								  [1,7,4,9,2,6,8,9,5],
								  [4,3,9,2,6,7,1,5,8],
								  [8,1,7,3,9,5,2,4,6],
								  [6,2,5,4,8,1,3,9,7]];
			});
			it('determines that the board is not solved', function(){
				expect(slv.solved()).toEqual(false);
			});
		});
	});
	describe('#subSquareIdx', function(){
		it("correctly converts a row, column pair to a subSquare offset", function(){
			expect(slv.subSquareIdx(2,2)).toEqual(0);
		});
	});
	describe('#inverseSubSquareIdx', function(){
		it("correctly converts an offset into a flattened version of the subSquare array to a row, col pair", function(){
			var target = [2,2];
			expect(slv.inverseSubSquareIdx(19)).toArrayEq([2,2]);
		});
	});
	describe('#processSubSquares', function(){
		beforeEach(function(){
			slv.board.data = [[5,0,8,0,4,1,6,0,0],
	                          [0,6,0,8,0,9,0,0,0],
	                          [1,0,0,6,0,0,5,4,0],
	                          [9,0,0,1,6,0,7,0,0],
	                          [0,0,0,5,7,2,0,0,0],
	                          [0,0,5,0,3,4,0,0,6],
	                          [0,1,4,0,0,5,0,0,2],
	                          [0,0,0,2,0,6,0,5,0],
	                          [0,0,6,4,8,0,3,0,9]];
		});
		it("creates a linear array of subgroups, stored in row-major order", function(){
			slv.processSubSquares();
			var target = [[5,0,8, 0,6,0, 1,0,0],
						  [0,4,1, 8,0,9, 6,0,0],
						  [6,0,0, 0,0,0, 5,4,0],
						  [9,0,0, 0,0,0, 0,0,5],
						  [1,6,0, 5,7,2, 0,3,4],
						  [7,0,0, 0,0,0, 0,0,6],
						  [0,1,4, 0,0,0, 0,0,6],
						  [0,0,5, 2,0,6, 4,8,0],
						  [0,0,2, 0,5,0, 3,0,9]];

			expect(slv.subSquares).toArrayEq(target);
		});
	});
	describe('#allButOne', function(){
		describe('horizontal case', function(){
			beforeEach(function(){
				slv.board.data = [[0,0,9,5,1,0,0,6,2],
		                          [6,3,4,0,0,0,5,9,0],
		                          [1,2,5,6,3,9,7,0,4],
		                          [0,0,0,0,0,0,0,0,0],
		                          [0,0,0,0,0,0,0,0,0],
		                          [0,0,0,0,0,0,0,0,0],
		                          [0,0,0,0,0,0,0,0,0],
		                          [0,0,0,0,0,0,0,0,0],
		                          [0,0,0,0,0,0,0,0,0]];
			});
			it('determines that a 1 can only be placed in cell [8, 1]', function(){
				slv.allButOne();
				var target = [[0,0,9,5,1,4,3,6,2],
	                          [6,3,4,0,0,0,5,9,1],
	                          [1,2,5,6,3,9,7,0,4],
	                          [0,0,0,0,0,0,0,0,0],
	                          [0,0,0,0,0,0,0,0,0],
	                          [0,0,0,0,0,0,0,0,0],
	                          [0,0,0,0,0,0,0,0,0],
	                          [0,0,0,0,0,0,0,0,0],
	                          [0,0,0,0,0,0,0,0,0]];
	            expect(slv.board.data).toArrayEq(target);
			});
		});
		describe('vertical case', function(){
			beforeEach(function(){
				slv.board.data = [[1,6,0,0,0,0,0,0,0],
		                          [2,3,0,0,0,0,0,0,0],
		                          [5,4,9,0,0,0,0,0,0],
		                          [6,0,5,0,0,0,0,0,0],
		                          [3,0,1,0,0,0,0,0,0],
		                          [9,0,0,0,0,0,0,0,0],
		                          [7,5,0,0,0,0,0,0,0],
		                          [0,9,6,0,0,0,0,0,0],
		                          [4,0,2,0,0,0,0,0,0]];
			});
			it('determines that 1 can only be placed in cell [ ]', function(){
				slv.allButOne();
				var target =[[1,6,0,0,0,0,0,0,0],
	                          [2,3,0,0,0,0,0,0,0],
	                          [5,4,9,0,0,0,0,0,0],
	                          [6,0,5,0,0,0,0,0,0],
	                          [3,0,1,0,0,0,0,0,0],
	                          [9,0,0,0,0,0,0,0,0],
	                          [7,5,3,0,0,0,0,0,0],
	                          [0,9,6,0,0,0,0,0,0],
	                          [4,1,2,0,0,0,0,0,0]];
	            expect(slv.board.data).toArrayEq(target);
			});
		});
	});
	describe('#eliminateGroups', function(){
		describe('when there is a triple in a row', function(){
			beforeEach(function(){
				slv.internalRepr = [[[2,3,4],[2,3,4],[2,3,4],[2,3,4,5],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]]];
			});
			it("eliminates possibilities conflicting with the triple in the row",function(){
				slv.eliminateTriples();
				var target = [[[2,3,4],[2,3,4],[2,3,4],[5],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]]];
				expect(slv.internalRepr).toArrayEq(target);
			});
		});
		describe('when there is a pair in a row', function(){
			beforeEach(function(){
				slv.internalRepr = [[[2,3],[2,3],[2,3,7],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]]];
				});
				it("eliminates possibilities conflicting with the pair in the row", function(){
					slv.eliminatePairs();
				var target = [[[2,3],[2,3],[7],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]]];
				expect(slv.internalRepr).toArrayEq(target);
			});
		});
		describe('when there is a pair in a column', function(){
			beforeEach(function(){
				slv.internalRepr = [[[2,3],[],[],[],[],[],[],[],[]],
									[[2,3],[],[],[],[],[],[],[],[]],
									[[2,3,7],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]]];
			});
			it("eliminates possibilities conflicting with the pair in the column", function(){
					slv.eliminatePairs();
				var target = [[[2,3],[],[],[],[],[],[],[],[]],
								[[2,3],[],[],[],[],[],[],[],[]],
								[[7],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]],
								[[],[],[],[],[],[],[],[],[]]];
				expect(slv.internalRepr).toArrayEq(target);
			});
		});
		describe('when there is no pair', function(){
			beforeEach(function(){
				slv.internalRepr = [[[2,3],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]]];
			});
			it("does nothing", function(){
				slv.eliminatePairs();
				var target = slv.internalRepr = [[[2,3],[],[],[],[],[],[],[],[]],
												[[],[],[],[],[],[],[],[],[]],
												[[],[],[],[],[],[],[],[],[]],
												[[],[],[],[],[],[],[],[],[]],
												[[],[],[],[],[],[],[],[],[]],
												[[],[],[],[],[],[],[],[],[]],
												[[],[],[],[],[],[],[],[],[]],
												[[],[],[],[],[],[],[],[],[]],
												[[],[],[],[],[],[],[],[],[]]];
				expect(slv.internalRepr).toArrayEq(target);	
			});
		});
		describe('when there is a pair, and it conflicts with nothing', function(){
			beforeEach(function(){
				slv.internalRepr = [[[2,3],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]]];
			});
			it("does nothing", function(){
				slv.eliminatePairs();;
				var target = slv.internalRepr = [[[2,3],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]],
									[[],[],[],[],[],[],[],[],[]]];
				expect(slv.internalRepr).toArrayEq(target);
			});
		});
		describe('when there is more than one pair', function(){
			beforeEach(function(){
					slv.internalRepr = [[[2,3],[2,3],[2,3,7],[],[],[],[],[],[]],
										[[],[],[],[],[],[],[],[],[]],
										[[],[],[],[],[],[],[],[],[]],
										[[],[],[],[],[],[],[],[],[]],
										[[],[],[],[],[],[],[],[],[]],
										[[],[],[],[],[],[],[],[],[]],
										[[],[4,5,6],[],[4,5],[4,5],[],[],[],[]],
										[[],[],[],[],[],[],[],[],[]],
										[[],[],[],[],[],[],[],[],[]]];
			});
			it("removes them all", function(){
					slv.eliminatePairs();
					var target = slv.internalRepr = [[[2,3],[2,3],[7],[],[],[],[],[],[]],
										[[],[],[],[],[],[],[],[],[]],
										[[],[],[],[],[],[],[],[],[]],
										[[],[],[],[],[],[],[],[],[]],
										[[],[],[],[],[],[],[],[],[]],
										[[],[],[],[],[],[],[],[],[]],
										[[],[6],[],[4,5],[4,5],[],[],[],[]],
										[[],[],[],[],[],[],[],[],[]],
										[[],[],[],[],[],[],[],[],[]]];
					expect(slv.internalRepr).toArrayEq(target);
			});
		});
		describe('when ther eis more than one triple', function(){
			beforeEach(function(){
				slv.internalRepr = [[[2,3,4],[2,3,4],[2,3,4],[2,3,4,5],[],[],[],[],[]],
							[[6,7,8],[6,7,8],[6,7,8],[6,7,8,9],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]]];
			});
			it("removes them all", function(){
				slv.eliminateTriples();
				var target = [[[2,3,4],[2,3,4],[2,3,4],[5],[],[],[],[],[]],
							[[6,7,8],[6,7,8],[6,7,8],[9],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]],
							[[],[],[],[],[],[],[],[],[]]];
				expect(slv.internalRepr).toArrayEq(target);
			});
		});
	});
});