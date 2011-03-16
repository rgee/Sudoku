function Board(){
	this.data = new Array(9);

	for(var i = 0; i < 9; i++){
		this.data[i] = new Array(9);
		for(var j = 0; j < 9; j++){
			this.data[i][j] = -1;
		}
	}
	console.log(this.data[0][8]);
}

Board.prototype = {
	fillSquare : function(row, col, val) {
		this.data[row][col] = val;
	}
};

/* Globals. Ohnoes. */
var gameBoard = new Board();
var term = new Object();
var context = new Object();

/* Performs all solver actions for one solver iteration. */
function update(){

}

function draw(proc){
	proc.selectedRow = 0;
	proc.selectedCol = 0;
	proc.keyboardMode = false;

	proc.mousePressed = function(){
		this.selectedRow = Math.floor((9 * (this.mouseY / this.height)));
		this.selectedCol = Math.floor((9 * (this.mouseX / this.width)));
		this.keyboardMode = true;
		
		term.put('Row: ' + this.selectedRow + ' Col: ' + this.selectedCol);
	};
	
	proc.keyPressed = function() {
		if(this.keyboardMode){
			gameBoard.fillSquare(this.selectedRow, this.selectedCol, key);
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
		
		var i = 0;
		var j = 0;
		for(i; i < 9; i++){
			for(j; j < 9; j++){
				context.fillText(gameBoard.data[i][j], i * (this.width / 9) + (this.width / 18),
				                                       j * (this.height / 9) + (this.height / 18));
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
jQuery(document).ready(function(){
	term = new Terminal('.terminal', 800, 300);
	$('.terminal').click(function(){ term.put('(right <= length && this.scorer(this.data[right]) > this.scorer(this.data[largest))'); });
	
	term.put(gameBoard.data);
	
	var procInstance = new Processing(document.getElementById('board'), draw);
	procInstance.size(800,600);
	context = document.getElementById('board').getContext('2d');
}); 