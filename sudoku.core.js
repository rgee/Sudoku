(function(global){
    function Sudoku(){
    }

    Sudoku.log = function(data){
            var logger = $('.log_output');

            (function(){
                if(logger.get(0) !== undefined){
                    logger.val(logger.val() + '\n' +data);
                    logger.get(0).scrollTop = logger.get(0).scrollHeight;
                }
            })();
        };   

    if(global.Sudoku){
        throw new Error("Sudoku namespace already defined.");
    }else{
        global.Sudoku = Sudoku;
    }

})(window);
