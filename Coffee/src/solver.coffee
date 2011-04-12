
class Solver
    constructor: (@board) ->
        @subSquares = []
        @internalRepr = new Array(9)        
        this.processSubSquares()
        this.calculatePotentials()

    processSubSquares: () ->
        @subSquares = []
    
        for row in [0..8] by 3
            for col in [0..8] by 3
                for y in [0..2]
                   @subSquares.push(this.board.data[col+x][row+y])

        @subSquares = [].concat @subSquares

    subSquareIdx: (row, col) ->
        (Math.floor(row/3)*3) + Math.floor(col/3)

    eliminateGroups: (length) -> 
        eliminateRowSupersets = (row, col, e) =>
            
              
        elimRowGroups = (row, col) =>
            elem = @internalRepr[row][col]
            elem = elem[0...elem.length]

            if elem.length is length
                temp = @internalRepr[row].slice(0)
                pos = temp.indexOf(elem)

                if pos isnt -1
                    numCopies = 1
                    (numCopies++ for tmp in temp)
                    if numCopies is length
                        @internalRepr[row] = (eliminateRowSupersets(row,col,el) for el in @internalRepr[row])

        elimColGroups = (row, col) =>
            for row in [0..8]
                for col in [0..8]
                    elimRowGroups(row, col)
                    elimColGroups(row, col)

    isValid: (row, col, val) ->
        rowCollection = (@board.data[row])[0...@board.data[row].length-1]
        colCollection = (@board.data[j][col] for j in [0..8])
        subSquareCollection = (@subSquares[this.subSquareIdx(row,col)])
        subSquareCollection = subSquareCollection

        return (val not in rowCollection) and (val not in colCollection) and (val not in subSquareCollection)
       
    calculatePotentials: () ->
        all = [1..9]
        genPotentials = (row, col) =>
            if not @board.data[row][col]
                possibilities = all[0...all.length]
                subSquareIdx = this.subSquareIdx(row, col)
                result = (i for i in all if this.isValid(row,col,i)) || []
                return result
            else
                return []

        @internalRepr = (((genPotentials(row, col)) for col in [0..8]) for row in [0..8])
        console.log @internalRepr

    eliminatePairs: () ->
        eliminateGroups(2)

    eliminateTrples: () ->
        eliminateGroups(3)
