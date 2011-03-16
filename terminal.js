function Terminal(DOMelem, width, height){
	this.elem = $(DOMelem);
	this.elem.css({'width': width + 'px',
				   'height': height + 'px',
				   'overflow' : 'auto',
				   'border' : '1px solid #666',
				   'background-color':'#ccc',
				   'padding':'8px',
				   'font-family': 'arial, helvetica'});
}

Terminal.prototype = {
	/* Print an object to the terminal. If the object has a prettyPrint method
	   that returns a string, the result of that will be output instead. */
	put : function(outObj) {
		var output = '';
		if(outObj === undefined) return;
		if(outObj.hasOwnProperty('prettyPrint')) {
			output = outObj.prettyPrint();
		} else {
			output = outObj;
		}
		
		this.elem.append('<p>' + '-> ' + output + '</p>');
		this.elem.scrollTop(this.elem[0].scrollHeight);
	}
};