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
				if(e){
					console.log("writing Error",e);
				}
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
			fs.readFile(file, function(e, contents){
				if(e){
					console.log("FS::Readfile", e);
					
				}
				if(typeof cb === "function"){
					cb(e, contents);
				}
				that.processQueue();
			});
		},
		
		mkdir: function(path, cb){
			if(this.queue.length === 0){
				this._mkdir(path, cb);
				return;
			}
			this.queue.push([this._mkdir, path, cb]);//no arguments
			
			
		},
		_mkdir: function(path, cb){
			fs.stat(path, function(err){
				if(err){
					console.log("mkdir err", err);
				}
				
				fs.mkdir(path, cb);
			});
			
		},
		
		move: function(a, b, cb){
			if(this.queue.length === 0){
				this._move(a, b, cb);
				return;
			}
			this.queue.push([this._move, a, b, cb]);//no arguments
		},
 
		_move: function(a, b, cb){
			fs.rename(a, b, cb);
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
				
				var p = path.normalize( path.relative( "../client", dir + path.sep + file));
				
				if(stats.isDirectory()){
					buffer.push({
						name: file,
						fullPath: p,
						contents: []
					});
					if(recurse){
						that._readdir(dir + path.sep + file, recurse, buffer[buffer.length-1].contents, function(){
							that._readdir_stat(dir, list, index + 1, cb, buffer, recurse);
						});
					}
					else{
						that._readdir_stat(dir, list, index + 1, cb, buffer, recurse);
					}
				}
				else{
					
					console.log("PATH:", p);
					buffer.push({
						name: file,
						fullPath: p
					});
					that._readdir_stat(dir, list, index + 1, cb, buffer, recurse);
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