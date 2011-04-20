(function(){
    var defaultEasyBoard = [[5,0,8,0,4,1,6,0,0],
                            [0,6,0,8,0,9,0,0,0],
                            [1,0,0,6,0,0,5,4,0],
                            [9,0,0,1,6,0,7,0,0],
                            [0,0,0,5,7,2,0,0,0],
                            [0,0,5,0,3,4,0,0,6],
                            [0,1,4,0,0,5,0,0,2],
                            [0,0,0,2,0,6,0,5,0],
                            [0,0,6,4,8,0,3,0,9]]
    function Board(defaultConfig){
        this.ready = false;
        if(defaultConfig !== undefined){
            this.data = defaultEasyBoard;
            this.ready = true;
        } else {
            this.data = new Array(9);
            for(var i = 0; i < 9; i++){
                this.data[i] = new Array(9);
                for(var j = 0; j < 9; j++){
                    this.data[i][j] = 0;
                }
            }
        }
    }

    Board.prototype = {
        fillSquare: function(row, col, val) {
            this.data[row][col] = val;
            if(!this.ready){
                this.ready = true;
            }
        }
    };

    Sudoku.Board = Board;
})();
