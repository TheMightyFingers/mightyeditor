MT.require("core.FS");

var inProgress = false;
var data = [];
var cbs = [];
var fname = ".queue";
var child = require('child_process');

MT.core.Queue = function(options, cb){
	var fs = MT.core.FS;
	var postman = MT.core.Queue.postman;
	
	if(inProgress){
		data.push(options);
		cbs.push(cb);
		fs.writeFile(fname, JSON.stringify(data));
		return;
	}
	
	inProgress = true;
	var next = function(){
		inProgress = false;
		if(!data.length){
			return;
		}
		var d = data.shift();
		var c = cbs.shift();
		fs.writeFile(fname, JSON.stringify(data), function(){
			MT.core.Queue(d, c);
		});
	};
	
	var ch = child.exec(options.cmd,  options.env , function(err, sout, serr){
		var error = sout.split("Error:");
		error.shift();
		if(err){
			MT.error("ERROR", err, options);
			MT.error(sout, serr);
			if(cb){
				cb(err, error);
			}
			next();
			return;
		}
		if(options.email && options.template){
			MT.log("SENDING MAIL to:", options.email);
			options.to = options.email;
			global.postman.send(options, options.template);
		}
		
		if(cb){
			cb(null, error);
		}
		next();
	});
};
(function(){
	MT.core.Queue.postman = global.postman;
	var fs = MT.core.FS;
	fs.readFile(fname, function(e, content){
		if(e){
			return;
		}
		data = JSON.parse(content);
		cbs.length = data.length;
	});
})();
