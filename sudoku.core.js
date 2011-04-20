(function(global){
    function Sudoku(){
    }
    if(global.Sudoku){
        throw new Error("Sudoku namespace already defined.");
    }else{
        global.Sudoku = Sudoku;
    }

})(window);
