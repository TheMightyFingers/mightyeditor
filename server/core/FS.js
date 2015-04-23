(function(){
	var fs = require("fs");
	var path = require("path");
	var errors = {
		ENOENT: 34
	};
	var that = MT.core.FS = {
		path: path,
		fs: fs,
		queue: [],
		
		after: function(cb){
			if(typeof cb != "function"){
				return;
			}
			this.addQueue([this._after, this.mkcb(cb)]);
		},
 
		_after: function(cb){
			cb();
		},
 
		exists: function(file, cb){
			this.addQueue([this._exists, file, this.mkcb(cb)]);
		},
		
		_exists: function(file, cb){
			fs.exists(file, cb);
		},
		
		writeFile: function(file, contents, cb, encoding){
			this.addQueue([this._writeFile, file, contents, encoding, this.mkcb(cb) ]);//no arguments
		},
 
		_writeFile: function(file_r, contents, encoding, cb){
			var file = file_r+Math.random();
			var t = this;
			if(encoding){
				fs.writeFile(file, contents, encoding, function(e){
					t._move(file, file_r, cb);
				});
			}
			else{
				fs.writeFile(file, contents, function(e){
					t._move(file, file_r, cb);
				});
			}
			
		},
		
		readFile: function(file, cb){
			this.addQueue([this._readFile, file, this.mkcb(cb)]);//no arguments
		},
 
		_readFile: function(file, cb){
			fs.readFile(file, function(e, contents){
				cb(e, contents);
				that.processQueue();
			});
		},
		
		mkdir: function(path, cb){
			this.addQueue([this._mkdir, path, this.mkcb(cb)]);//no arguments
		},
 
		_mkparent: function(dest, cb){
			var that = this;
			var par = path.dirname(dest);
			if(par == dest){
				MT.log("failed to create directory");
				cb();
				return;
			}
			this._mkdir(par, cb);
		},
		_mkdir: function(dest, cb){
			var that = this;
			fs.mkdir(dest, function(err){
				if(err && err.code == 'ENOENT') {
					that._mkparent(dest, cb);
				}
				else{
					if(err){
						if(err.code != 'EEXIST'){
							console.log("MKDIR err", err);
						}
					}
					cb();
				}
			});
		},
		
		move: function(a, b, cb){
			this.addQueue([this._move, a, b, this.mkcb(cb)]);//no arguments
		},
 
		_move: function(a, b, cb){
			fs.rename(a, b, cb);
		},
		
		copy: function(a, b, cb){
			this.addQueue([this._copyWrap, a, b, this.mkcb(cb)]);//no arguments
		},
 
		_copyWrap: function(source, target, cb){
			fs.stat(source, function(err, stats){
				if(err){
					MT.stack("Cnnot find source:", source, err.message);
					cb(err);
					return;
				}
				
				
				if(stats.isDirectory()){
					that._mkdir(target, function(){
						
						that._readdir(source, true, [], function(buff){
							var toCopy = buff.length;
							var cbx = function(){
								toCopy--;
								if(toCopy == 0){
									cb();
								}
							};
							
							for(var i=0; i<buff.length; i++){
								that._copyWrap(buff[i].fullPath, target + path.sep + buff[i].name, cbx);
							}
							
							if(toCopy == 0){
								cb();
							}
							
						});
						
					});
					
				}
				else{
					var dirname = that.path.dirname(target);
					// check if directory exists
					fs.stat(dirname, function(err){
						if(err){
							that._mkdir(dirname, function(){
								that._copyWrap(source, target, cb);
							});
						}
						else{
							that._copy(source, target, cb);
						}
					});
				}
				
			});
			
		},
		
		_copy: function(source, target, cb) {
			
			var rd = fs.createReadStream(source);
			rd.on("error", function(err) {
				console.log("\n\n\n","READ STREAM ERROR", err, "\n\n\n");
				done(err);
			});
			
			var wr = fs.createWriteStream(target);
			wr.on("error", function(err) {
				console.log("\n\n\n","WRITE STREAM ERROR - (no dir??)", err, "\n\n\n");
				done(err);
			});
			
			wr.on("close", function(ex) {
				done();
			});
			
			rd.pipe(wr);

			function done(err) {
				if(err){
					MT.debug(err, "FS::copy error ---> ", source + " -> " + target);
					//return;
				}
				if(typeof cb == "function"){
					cb();
				}
			}
			
		},
		
 
		rm: function(file, cb){
			this.addQueue([this._rm, file, this.mkcb(cb)]);//no arguments
		},
		_rm: function(file, cb){
			var that = this;
			fs.lstat(file, function(err, stats){
				if(err){
					MT.log("FS::rm error", err);
					cb(err);
					return;
				}
				if(stats.isDirectory()){
					that._rmdir(file, cb);
					return;
				}
				fs.unlink(file, cb);
				
			});
			
		},
 
		rmdir: function(dir, cb){
			this.addQueue([this._rmdir, dir, this.mkcb(cb)]);
		},
		_rmdir: function(dir, cb){
			var that = this;
			this._readdir(dir, true, [], function(buffer){
				var d = null;
				
				if(buffer.length == 0){
					fs.rmdir(dir, cb);
					return;
				}
				
				
				for(var i=0; i<buffer.length; i++){
					d = buffer[i];
					//direcotry
					if( d.contents != void(0) ){
						if(d.contents.length){
							that._rmdir(dir + path.sep + d.name, function(){
								that._rmdir(dir, cb);
							});
						}
						else{
							fs.rmdir(dir + path.sep + d.name, function(){
								that._rmdir(dir, cb);
							});
						}
						break;
					}
					//file
					fs.unlink(dir + path.sep + d.name, function(){
						that._rmdir(dir, cb);
					});
					break;
				}
				
			});
		},
 
		readdir: function(dir, recurse, cb){
			if(typeof(recurse) == "function"){
				cb = recurse;
				recurse = false;
			}
			
			this.addQueue([this._readdir, dir, recurse, [], this.mkcb(cb)]);//no arguments
			
		},
		
		_readdir: function(dir, recurse, buffer, cb){
			fs.readdir(dir, function(err, files){
				if(err){
					MT.error(err);
					cb(buffer, err);
					return;
				}
				that._readdir_stat(dir, files, 0, cb, buffer, recurse);
			});
			
		},
		
 
		_readdir_stat: function(dir, list, index, cb, buffer, recurse){
			if(!list || index >= list.length){
				cb(buffer);
				return;
			}
			var file = list[index];
			var toRead = 0;
			fs.lstat(dir + path.sep + file, function(err, stats){
				if(err){
					MT.error(err);
					cb(buffer, err);
					return;
				}
				var p = dir + path.sep + file;
				
				if(stats.isDirectory()){
					buffer.push({
						name: file,
						fullPath: p,
						stats: stats,
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
					buffer.push({
						name: file,
						stats: stats,
						fullPath: p
					});
					that._readdir_stat(dir, list, index + 1, cb, buffer, recurse);
				}
			});
		},
		processing: false,
		activeTaks: null,
 
		processQueue: function(){
			if(this.processing){
				return;
			}
			
			var next = this.queue.shift();
			if(next){
				this.activeTaks = next;
				
				this.processing = true;
				next.shift().apply(this, next);
			}
			else{
				this.processing = false;
			}
		},
		
		addQueue: function(q){
			this.queue.push(q);
			this.processQueue();
		},
 
		mkcb: function(cb){
			var that = this;
			var cbx = function(a, b, c, d){
				if(typeof cb === "function"){
					cb(a, b, c, d);
				}
				that.processing = false;
				that.processQueue();
			};
			
			return cbx;
		}
	};
	
	
})();