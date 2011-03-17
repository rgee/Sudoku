
/* The sudoku "solver" itself. Responsible for knowledge representation as well
   as action selection */
function Solver(){
	/* Binary max heap of sub-square objects. Sub-squares have an index
	   representing their position on the board and an array of their filled
	   numbers. The scoring function for the heap is the length of this array.

	   The idea is that I always look for the most complete subsquares
	   first when trying to find trivial solutions like a subsquare with 8 cells
	   filled.
	*/
	this.subSquareHeap = new BinHeap(function(u){return u.data.length;});
}

Solver.prototype = {
	/* Run through all knowledge-refinement and square-filling tactics once. */
	solve: function(){
	},
	processSubSquares: function(){
		this.subSquareHeap.clear();
		var row = 0;
		for(var col = 0; col < 3; col++){
			for(var row = 0; row < 3; row++){
				var data = new Array();
				for(var x = 0; x < 3; ++x){
					for(var y = 0; y < 3; ++y){
						var current = gameBoard.data[(row*3) + y][(col*3) + x];
						if(current) {
							data.push(current);
						}
					}
				}
				var subObj = {'idx' : [col,row],
							  'data' : data};
				this.subSquareHeap.push(subObj);
			}
			
		}
		console.log(this.subSquareHeap);
	},
	/* Fill in a square on the grid and update internal representations */
	fillSquare : function(row, col, val){
		this.processSubSquares();
	}
};

function Board(){
	this.data = new Array(9);

	for(var i = 0; i < 9; i++){
		this.data[i] = new Array(9);
		for(var j = 0; j < 9; j++){
			this.data[i][j] = 0;
		}
	}
	console.log(this.data);
}

Board.prototype = {
	fillSquare : function(row, col, val) {
		this.data[row][col] = val;
	}
};

/* Performs all solver actions for one solver iteration. */
function update(){

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
		context.font = 'italic 30px sans-serif';
		context.fillStyle = '#000';
		context.textBaseline = 'top';
	
		for(var x = 0; x < 9; x++){
			for(var y = 0; y < 9; y++){
				if(gameBoard.data[x][y]) {
					context.fillText(gameBoard.data[x][y], x * (this.width / 9) + (this.width / 18),
														   y * (this.height / 9) + (this.height / 18));
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

/* Globals. Ohnoes. */
var gameBoard = new Board();
var term = new Object();
var context = new Object();
var solver = new Solver();

jQuery(document).ready(function(){
	term = new Terminal('.terminal', 800, 300);
	$('.terminal').click(function(){ term.put('(right <= length && this.scorer(this.data[right]) > this.scorer(this.data[largest))'); });
	
	term.put(gameBoard.data);
	
	var procInstance = new Processing(document.getElementById('board'), draw);
	procInstance.size(800,600);
	context = document.getElementById('board').getContext('2d');
	
	solver.processSubSquares();
}); 