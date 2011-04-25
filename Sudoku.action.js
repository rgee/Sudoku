(function(){
	var actions = ["SQUARE_FILLED", "INVALID"];
	function Action(type, data){
		this.type = (actions.indexOf(type) === -1 ? "INVALID" : type);
		this.data = data || {};
	}

	function SquareFillData(row, col, val){
		this.row = row;
		this.col = col;
		this.val = val;
	}

	Sudoku.Action = Action;
	Sudoku.SquareFillData = SquareFillData;
})();