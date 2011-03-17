/* Standard binary heap. Constructed with a score function that returns
   some sort of score value for the elements stored. Return a positive value
   for a min heap and a negative value for a max heap. */
function BinHeap(scoreFunc){
	this.data = new Array();
	this.scorer = scoreFunc;
}

BinHeap.prototype = {
	/* Wipe out the entire heap. */
	clear: function() {
		this.data = new Array();
	},
	/* Add an element to the heap. */
	push: function(element) {
		this.data.push(element);
		this.bubbleUp(this.data.length - 1)
	},
	
	/* Returns true if the heap is empty, false otherwise. */
	isEmpty: function() {
		return (this.data.length === 0);
	},
	
	/* Remove the top element from the heap. */
	pop: function() {
		var result = this.data[0];
		var end = this.data.pop();
		
		if(this.data.length > 0) {
			this.data[0] = end;
			this.bubbleDown(0);
		}
		return result;
	},
	
	/* Re-order the heap */
	bubbleUp: function(idx) {
		var elem = this.data[idx];
		var parentIndex = 0;
		var parent = null;
		
		while(idx > 0) {
			parentIndex = Math.floor((idx - 1) / 2);
			parent = this.data[parentIndex];
			
			if(this.scorer(parent) < this.scorer(elem)) {
				this.data[parentIndex] = elem;
				this.data[idx] = parent;
				idx = parentIndex;
			} else {
				break;
			}
		}
	},
	
	/* Re-order the heap */
	bubbleDown: function(idx) {
		var left = 2 * idx;
		var right = (2 * idx) + 1;
		var largest = idx;
		var length = this.data.length;
		var temp = null;
		
		if(left <= length && this.scorer(this.data[left]) > this.scorer(this.data[idx])) {
			largest = left;
		}
		
		if(right <= length && this.scorer(this.data[right]) > this.scorer(this.data[largest])) {
			largest = right;
		}
		
		if(largest !== idx) {
			temp = this.data[idx];
			this.data[idx] = this.data[largest];
			this.data[largest] = temp;
			this.bubbleDown(largest);
		}
	}
};
