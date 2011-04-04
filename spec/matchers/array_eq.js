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

Screw.Matchers['array_eq'] = {
	
	match: function(expected, actual){
		
		return expected.compareArrays(actual);
	},
	failure_message : function(expected, actual, not){
		
		return 'expected ' + $.print(actual) + (not ? 'not' : '') + ' to be equal to ' + expected;
	}
}