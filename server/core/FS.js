(function(){
	var fs = require("fs");
	var path = require("path");
	var that = MT.core.FS = {
		queue: [],
 
		writeFile: function(file, contents, encoding, cb){
			if(this.queue.length === 0){
				this._writeFile(file, contents, encoding, cb);
				return;
			}
			this.queue.push([this._writeFile, file, contents, cb]);//no arguments
		},
 
		_writeFile: function(file, contents, cb){
			console.log("writing....");
			
			fs.writeFile(file, contents, function(e){
				if(typeof cb === "function"){
					cb(e);
				}
				that.processQueue();
			});
			
		},
		
		readFile: function(file, encoding, cb){
			if(this.queue.length === 0){
				this._readFile(file, cb);
				return;
			}
			this.queue.push([this._readFile, file, cb]);//no arguments
		},
 
		_readFile: function(file, cb){
			fs.readFile(file, function(e){
				if(typeof cb === "function"){
					cb(e);
				}
				that.processQueue();
			});
		},
 
		readdir: function(dir, recurse, cb){
			var buffer = [];
			if(this.queue.length === 0){
				this._readdir(dir, recurse, cb);
				return;
			}
			this.queue.push([this._readdir, dir, recurse, buffer, cb]);//no arguments
			
		},
		
		_readdir: function(dir, recurse, buffer, cb){
			
			var process = function(e){
				if(typeof cb === "function"){
					cb(e);
				}
				that.processQueue();
			};
			
			
			
			fs.readdir(dir, function(files, err){
				var toRead = 0;
				for(var i=0; i<files.length; i++){
					fs.lstat(files[i], function(stats){
						if(stats.isDirectory()){
							buffer.push({
								name: files[i],
								contents: []
							});
							if(recurse){
								toRead++;
								that._readdir(dir + path.sep + files[i], recurse, buffer, function(){
									toRead--;
									if(toRead == 0){
										process();
									}
								});
							}
							
						}
						else{
							buffer.push({
								name: files[i]
							});
						}
					})
				}
				
				if(toRead === 0){
					process();
				}
				
			});
			
		},
		
		processQueue: function(){
			var next = this.queue.shift();
			if(next){
				next.shift().apply(this, next);
			}
		}
	};
	
	
})();