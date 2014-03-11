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
				this._readdir(dir, recurse, buffer, cb);
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
			
			
			
			fs.readdir(dir, function(err, files){
				if(err){
					console.log("FS:EROR",err);
				}
				that._readdir_stat(dir, files, 0, process, buffer, recurse);
			});
			
		},
		
 
		_readdir_stat: function(dir, list, index, cb, buffer, recurse){
			if(index >= list.length){
				cb(buffer);
				return;
			}
			var file = list[index];
			var toRead = 0;
			
			console.log("stat: ", dir + path.sep + file);
			
			fs.lstat(dir + path.sep + file, function(err, stats){
				if(stats.isDirectory()){
					buffer.push({
						name: file,
						contents: []
					});
					if(recurse){
						toRead++;
						that._readdir(dir + path.sep + file, recurse, buffer[buffer.length-1].contents, function(){
							toRead--;
							if(toRead == 0){
								that._readdir_stat(dir, list, index + 1, cb, buffer);
							}
						});
					}
				}
				else{
					buffer.push({
						name: file
					});
				}
				
				if(toRead == 0){
					that._readdir_stat(dir, list, index + 1, cb, buffer);
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