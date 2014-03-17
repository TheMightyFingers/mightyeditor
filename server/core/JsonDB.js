MT.require("core.FS");
MT(
	MT.core.JsonDB = function(file, onReady){
		this.dbfile = file;
		this.fs = MT.core.FS;
		
		if(this.cache[file]){
			console.log("cache", file);
			this.data = this.cache[file];
			onReady(this);
			return;
		}
		
		
		this.readData(onReady);
		
	},
	{
		cache: {},
		readData: function(cb){
			var that = this;
			this.fs.readFile(this.dbfile, function(err, contents){
				if(err){
					that.data = {
						contents: [],
						count: 0
					};
				}
				else{
					that.data = JSON.parse(contents);
				}
				
				
				that.cache[that.dbfile] = that.data;
				if(typeof cb === "function"){
					cb(that);
				}
			});
			
		},
   
		save: function(cb){
			var that = this;
			this.fs.writeFile(this.dbfile, JSON.stringify(this.data), function(){
				console.log("saved data", that.data);
			});
		},
		
		get: function(name){
			
			//console.log("DB::GET", name, this.data);
			
			var folders = name.split("/");
			var fi = 0;
			var ret = this.data;
			var data = ret.contents;
			
			for(var i=0; i<data.length; i++){
				if(data[i].name == folders[fi]){
					fi++;
					ret = data[i];
					data = ret.contents;
					i = -1;
					
					if(fi == folders.length){
						return ret;
					}
				}
			}

			for(var i=fi; i<folders.length; i++){
				var d = {
					name: folders[i],
					contents: [],
					count: 0
				};
				data.push(d);
				ret.count++;
				
				ret = d;
				data = d.contents;
			}

			return ret;
			
		},
		
		getParent: function(name){
			
			//console.log("DB::GET", name, this.data);
			
			var folders = name.split("/");
			var fi = 0;
			var ret = null;
			var data = ret.contents;
			
			for(var i=0; i<data.length; i++){
				if(data[i].name == folders[fi]){
					fi++;
					ret = data[i];
					data = ret.contents;
					i = -1;
					
					if(fi == folders.length){
						return data;
					}
				}
			}
			console.error("CANNOT FIND PARENT FOR:",name);
			return ret;
			
		},
		
		
   
		move: function(a, b){
			var adb = this.delete(a);
			if(adb.length === 0){
				console.log("DB::bad item", a);
				return;
				
			}
			console.log("ADB", adb);
			
			var bdb = null;
			
			var pb = b.split("/");
			var name = pb.pop();
			var parent = this.get(pb.join("/"));
			
			
			console.log("PARRENT",parent);
			adb[0].name = name;
			
			parent.contents.push(adb[0]);

		},
   
		delete: function(name){
			
			var folders = name.split("/");
			var fi = 0;
			
			var data = this.data.contents;
			var i=0;
			
			console.log("DB::delete", name, folders);
			
			while(true){
				if(data[i].name == folders[fi]){
					fi++;
					
					if(fi == folders.length){
						return data.splice(i, 1);;
					}
					
					data = data[i].contents;
					i = 0;
					continue;
				}
				
				i++;
				if(i>=data.length){
					break;
				}
				
			}
		}
		
		
	}
);




