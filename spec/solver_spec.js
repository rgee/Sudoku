Screw.Unit(function(){
	describe('solver', function(){
		var slv;
		before(function(){
			slv = Solver(GameBoard());
		});
		describe('#eliminatePairs', function(){
			describe('when there is a pair', function(){
				before(function(){
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
 				it("eliminates possibilities conflicting with pairs", function(){
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
					expect(slv.internalRepr).to(array_eq, target);
				});
			});
			describe('when there is no pair', function(){
				before(function(){

				});
				it("does nothing", function(){

				});
			});
		});
	});
});