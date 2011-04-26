(function(){
	// Valid actions
	var actions = ["SQUARE_FILLED", "INVALID"];

	// Represents an action taken on the grid.
	function Action(type, data){
		// The type of action taken.
		this.type = (actions.indexOf(type) === -1 ? "INVALID" : type);

		// The data about this action.
		this.data = data || {};
	}

	// Data for a square-filling action.
	function SquareFillData(row, col, val){
		this.row = row;
		this.col = col;
		this.val = val;
	}

	Sudoku.Action = Action;
	Sudoku.SquareFillData = SquareFillData;
})();