Array.prototype.compareArrays = function(arr) {
    if (this.length != arr.length) return false;
    for (var i = 0; i < arr.length; i++) {
        if (this[i].compareArrays) { //likely nested array
            if (!this[i].compareArrays(arr[i])) return false;
            else continue;
        }
        if (this[i] != arr[i]) return false;
    }
    return true;
};

beforeEach(function() {
  this.addMatchers({
  	toArrayEq: function(other){
  		var that = this.actual;
  		return that.compareArrays(other);	
  	}
  })
});
