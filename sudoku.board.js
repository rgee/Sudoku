(function(){
    var defaultEasyBoard = [[5,0,8,0,4,1,6,0,0],
                            [0,6,0,8,0,9,0,0,0],
                            [1,0,0,6,0,0,5,4,0],
                            [9,0,0,1,6,0,7,0,0],
                            [0,0,0,5,7,2,0,0,0],
                            [0,0,5,0,3,4,0,0,6],
                            [0,1,4,0,0,5,0,0,2],
                            [0,0,0,2,0,6,0,5,0],
                            [0,0,6,4,8,0,3,0,9]],
        defaultMediumBoard = [[0,0,3,8,1,0,6,7,0],
                              [7,0,0,6,4,0,0,0,3],
                              [0,9,0,0,0,3,0,0,0],
                              [3,0,0,7,0,0,0,1,4],
                              [0,0,0,0,0,0,0,0,0],
                              [1,7,0,0,0,6,0,0,5],
                              [0,0,0,2,0,0,0,5,0],
                              [8,0,0,0,9,5,0,0,6],
                              [0,2,5,0,8,1,3,0,0]],
        allButOneTestBoardH = [[0,0,9,5,1,0,0,6,2],
                              [6,3,4,0,0,0,5,9,0],
                              [1,2,5,6,3,9,7,0,4],
                              [0,0,0,0,0,0,0,0,0],
                              [0,0,0,0,0,0,0,0,0],
                              [0,0,0,0,0,0,0,0,0],
                              [0,0,0,0,0,0,0,0,0],
                              [0,0,0,0,0,0,0,0,0],
                              [0,0,0,0,0,0,0,0,0]],
        allButOneTestBoardV = [[1,6,0,0,0,0,0,0,0],
                              [2,3,0,0,0,0,0,0,0],
                              [5,4,9,0,0,0,0,0,0],
                              [6,0,5,0,0,0,0,0,0],
                              [3,0,1,0,0,0,0,0,0],
                              [9,0,0,0,0,0,0,0,0],
                              [7,5,0,0,0,0,0,0,0],
                              [0,9,6,0,0,0,0,0,0],
                              [4,0,2,0,0,0,0,0,0]],
        defaultEvilBoard = [[3,0,0,5,9,0,0,1,0],
                            [0,0,6,0,0,0,0,0,4],
                            [0,0,0,0,8,0,0,3,0],
                            [1,0,0,6,0,0,2,0,0],
                            [0,0,8,0,3,0,7,0,0],
                            [0,0,2,0,0,1,0,0,5],
                            [0,9,0,0,1,0,0,0,0],
                            [2,0,0,0,0,0,3,0,0],
                            [0,6,0,0,4,7,0,0,8]],
        defaultVeryHardBoard = [[0,0,0,0,0,0,0,0,0],
                                [0,0,0,0,0,3,0,8,5],
                                [0,0,1,0,2,0,0,0,0],
                                [0,0,0,5,0,7,0,0,0],
                                [0,0,4,0,0,0,1,0,0],
                                [0,9,0,0,0,0,0,0,0],
                                [5,0,0,0,0,0,0,7,3],
                                [0,0,2,0,1,0,0,0,0],
                                [0,0,0,0,4,0,0,0,9]];
    function Board(defaultConfig, proc){
        this.ready = false;
        this.proc = proc;
        if(defaultConfig === true){
            this.data = defaultEvilBoard;
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
        // Fill in a square on the board. 
        fillSquare: function(row, col, val) {
            this.data[row][col] = val;
            if(!this.ready){
                this.ready = true;
            }
        },
        parseBoard: function(board){
            var result = [];
            var arr = board.trim().split('').map(function(e){
                return (e === '.' ? 0 : parseInt(e));
            });

            for(var rowStart = 0, rowEnd = 9; rowEnd <= 81; rowStart += 9, rowEnd += 9){
              result.push(arr.slice(rowStart, rowEnd));
            }
            console.log(result);
            this.data = result;
            this.ready = true;
        },
        // Extracts a particular column (in the range of 0 to 8) from the board as an array.
        getColumn: function(col){
            var result = [];
            this.data.forEach(function(e){
                result.push(e[col]);
            });
            return result;
        }
    };

    Sudoku.Board = Board;
})();
