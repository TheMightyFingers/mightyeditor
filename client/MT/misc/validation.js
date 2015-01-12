MT.misc = MT.misc || {};
MT.misc.validation = {
	email: function(inp) { 
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(inp);
	},
		
	password: function(inp) { 
		var re = /(?=.*\d)(?=.*[a-z]).{6,}/;
		return re.test(inp);
	}
};