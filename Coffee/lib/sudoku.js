(function() {
  var Board, Solver;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  Board = (function() {
    function Board(board) {
      this.defaultBoard = [[5, 0, 8, 0, 4, 1, 6, 0, 0], [0, 6, 0, 8, 0, 9, 0, 0, 0], [1, 0, 0, 6, 0, 0, 5, 4, 0], [9, 0, 0, 1, 6, 0, 7, 0, 0], [0, 0, 0, 5, 7, 2, 0, 0, 0], [0, 0, 5, 0, 3, 4, 0, 0, 6], [0, 1, 4, 0, 0, 5, 0, 0, 2], [0, 0, 0, 2, 0, 6, 0, 5, 0], [0, 0, 6, 4, 8, 0, 3, 0, 9]];
      if (board === void 0) {
        this.data = this.defaultBoard;
      }
    }
    return Board;
  })();
  Solver = (function() {
    function Solver(board) {
      this.board = board;
      this.subSquares = [];
      this.internalRepr = new Array(9);
      this.processSubSquares();
      this.calculatePotentials();
    }
    Solver.prototype.processSubSquares = function() {
      var col, row, y;
      this.subSquares = [];
      for (row = 0; row <= 8; row += 3) {
        for (col = 0; col <= 8; col += 3) {
          for (y = 0; y <= 2; y++) {
            this.subSquares.push(this.board.data[col + x][row + y]);
          }
        }
      }
      return this.subSquares = [].concat(this.subSquares);
    };
    Solver.prototype.subSquareIdx = function(row, col) {
      return (Math.floor(row / 3) * 3) + Math.floor(col / 3);
    };
    Solver.prototype.eliminateGroups = function(length) {
      var elimColGroups, elimRowGroups, eliminateRowSupersets;
      eliminateRowSupersets = __bind(function(row, col, e) {}, this);
      elimRowGroups = __bind(function(row, col) {
        var el, elem, numCopies, pos, temp, tmp, _i, _len;
        elem = this.internalRepr[row][col];
        elem = elem.slice(0, elem.length);
        if (elem.length === length) {
          temp = this.internalRepr[row].slice(0);
          pos = temp.indexOf(elem);
          if (pos !== -1) {
            numCopies = 1;
            for (_i = 0, _len = temp.length; _i < _len; _i++) {
              tmp = temp[_i];
              numCopies++;
            }
            if (numCopies === length) {
              return this.internalRepr[row] = (function() {
                var _i, _len, _ref, _results;
                _ref = this.internalRepr[row];
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  el = _ref[_i];
                  _results.push(eliminateRowSupersets(row, col, el));
                }
                return _results;
              }).call(this);
            }
          }
        }
      }, this);
      return elimColGroups = __bind(function(row, col) {
        var col, _results;
        _results = [];
        for (row = 0; row <= 8; row++) {
          _results.push((function() {
            var _results;
            _results = [];
            for (col = 0; col <= 8; col++) {
              elimRowGroups(row, col);
              _results.push(elimColGroups(row, col));
            }
            return _results;
          })());
        }
        return _results;
      }, this);
    };
    Solver.prototype.isValid = function(row, col, val) {
      var colCollection, j, rowCollection, subSquareCollection;
      rowCollection = this.board.data[row].slice(0, this.board.data[row].length - 1);
      colCollection = (function() {
        var _results;
        _results = [];
        for (j = 0; j <= 8; j++) {
          _results.push(this.board.data[j][col]);
        }
        return _results;
      }).call(this);
      subSquareCollection = this.subSquares[this.subSquareIdx(row, col)];
      subSquareCollection = subSquareCollection;
      return (__indexOf.call(rowCollection, val) < 0) && (__indexOf.call(colCollection, val) < 0) && (__indexOf.call(subSquareCollection, val) < 0);
    };
    Solver.prototype.calculatePotentials = function() {
      var all, col, genPotentials, row;
      all = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      genPotentials = __bind(function(row, col) {
        var i, possibilities, result, subSquareIdx;
        if (!this.board.data[row][col]) {
          possibilities = all.slice(0, all.length);
          subSquareIdx = this.subSquareIdx(row, col);
          result = ((function() {
            var _i, _len, _results;
            if (this.isValid(row, col, i)) {
              _results = [];
              for (_i = 0, _len = all.length; _i < _len; _i++) {
                i = all[_i];
                _results.push(i);
              }
              return _results;
            }
          }).call(this)) || [];
          return result;
        } else {
          return [];
        }
      }, this);
      this.internalRepr = (function() {
        var _results;
        _results = [];
        for (row = 0; row <= 8; row++) {
          _results.push((function() {
            var _results;
            _results = [];
            for (col = 0; col <= 8; col++) {
              _results.push(genPotentials(row, col));
            }
            return _results;
          })());
        }
        return _results;
      })();
      return console.log(this.internalRepr);
    };
    Solver.prototype.eliminatePairs = function() {
      return eliminateGroups(2);
    };
    Solver.prototype.eliminateTrples = function() {
      return eliminateGroups(3);
    };
    return Solver;
  })();
}).call(this);
