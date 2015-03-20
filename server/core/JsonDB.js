MT.require("core.FS");
MT(
	MT.core.JsonDB = function(file, onReady){
		this.dbfile = file;
		this.fs = MT.core.FS;
		
		if(this.cache[file]){
			this.data = this.cache[file].data;
			this.cache[file].connections++;
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
					try{
						that.data = JSON.parse(contents);
					}
					catch(e){
						MT.error(e, "FAILED TO PARSE DB");
						
						that.fs.copy(that.dbfile, that.fs.path.dirname(that.dbfile) + that.fs.path.sep + Date.now()+".db-backup");
						
						//that.fs.writeFile(that.fs.path.dirname(that.dbfile) + that.fs.path.sep + Date.now()+".db-backup", contents);
						that.data = {
							contents: [],
							count: 0
						};
					}
				}
				
				that.cache[that.dbfile] = {
					data: that.data,
					connections: 1
				};
				if(typeof cb === "function"){
					cb(that);
				}
			});
			
		},
		save: function(cb){
			var that = this;
			this.fs.writeFile(this.dbfile, JSON.stringify(this.data, null, "\t"), function(){
				if(typeof cb == "function"){
					cb();
				}
			});
		},
		
		// /source/xxx/smth.js
		get: function(name){
			if(name == "" || name == "/"){
				return this.data;
			}
			var folders = name.split("/");
			if(folders[0] == ""){
				folders.shift();
			}
			
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
			return ret;
			
		},
		
		
   
		move: function(a, b){
			var tmp = a.split("/");
			
			var aname = tmp.pop();
			var abase = tmp.join("/");
			
			tmp = b.split("/");
			
			var bname = tmp.pop();
			var bbase = tmp.join("/");
			
			var aItem = this.get(a);
			
			if(abase == bbase){
				aItem.name = bname;
				this.save();
				return;
			}
			
			var apar = this.get(abase);
			for(var i=0; i<apar.contents.length; i++){
				if(apar.contents[i] == aItem){
					apar.contents.splice(i, 1);
				}
			}
			
			var bpar = this.get(bbase);
			bpar.contents.push(aItem);
			aItem.name = bname;
			this.save();
			
			return;
		},
   
		delete: function(name){
			
			var folders = name.split("/");
			var fi = 0;
			var data = this.data.contents;
			
			var i=0;
			
			while(true){
				if(!data[i]){
					break;
				}
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
			
			return null;
		},
   
		close: function(){
			this.save();
			if(this.cache[this.dbfile]){
				if(this.cache[this.dbfile].connections == 1){
					this.cache[this.dbfile] = null;
					return;
				}
				this.cache[this.dbfile].connections--;
			}
		}
	}
);




