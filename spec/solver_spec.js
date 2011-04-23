describe('solver', function(){
	var slv, brd;
	beforeEach(function(){
		brd = new Sudoku.Board(true);
		slv = new Sudoku.Solver(brd);
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