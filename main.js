$(document).ready(function(){    
    function displayError(text){
        var errorDiv = $('#errors');
        var result = $('#errortext')
                        .html(text)
                        .css({"visibility":"visible"})
                        .appendTo(errorDiv);
        
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
            context.font = 'italic 15px sans-serif';
            context.fillStyle = '#000';
        
            for(var y = 0; y < 9; y++){
                for(var x = 0; x < 9; x++){
                    if(gameBoard.data[x][y]) {
                        context.fillText(gameBoard.data[x][y], y * (this.height / 9) + (this.height / 18),
                                                               x * (this.width / 9) + (this.width / 18));
                    }
                }
            }
        }
        
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


    function startSolve(solver, board){
        if(!board.ready){
            board.parseBoard($('#puzzle_input').val());
        }

        if(gameBoard.ready){
            setInterval(function(){
                solver.solve();
            }, 100);
        }else{
            displayError("Game board not initialized. Enter at least one number.");
        }
    }
    

    var term, context, solver, gameBoard, procInstance;
    procInstance = new Processing(document.getElementById('board'), draw);
    procInstance.size(400,400);
    context = document.getElementById('board').getContext('2d');

    gameBoard = new Sudoku.Board(false, procInstance);
    solver = new Sudoku.Solver(gameBoard);
    

    $("#start").click(function(){startSolve(solver, gameBoard);});
});
