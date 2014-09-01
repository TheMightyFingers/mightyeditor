(function(){

var log = MT.core.Logger = {
	log: function(){
		console.log.apply(console, log._message(arguments) );
	},
	error: function(){
		console.error.apply(console, log._message(arguments) );
	},
	debug: function(error){
		console.error.apply(console, log._message(arguments) );
		console.error("stack trace"+"\n");
		console.error(error.stack);
		console.error("\n");
	},
	
	stack: function(name){
		try{
			throw new Error(name);
		}
		catch(e){
			var args = arguments;
			args[0] = e;
			log.debug.apply(log, args);
		}
	},
	
	_message: function(parts){
		return [log.mktime()].concat(Array.prototype.slice.call(parts) );
	},
	mktime: function(){
		return (new Date).toISOString().split(".").shift().replace(/T/," ") + ": ";
	}
};

MT.log = log.log;
MT.error = log.error;
MT.debug = log.debug;
MT.stack = log.stack;

})();