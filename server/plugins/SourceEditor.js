"use strict";

MT.require("core.FS");


MT.extend("core.BasicPlugin")(
	MT.plugins.SourceEditor = function(project){
		MT.core.BasicPlugin.call(this, project, "source");
		this.ids = {};

		this.data = this.project.db.get(this.name);
		this.fs = MT.core.FS;
		this.source = "src";
		this.path = this.fs.path.resolve(this.project.path + this.fs.path.sep + this.source);
		if(this.data.contents.length === 0){
			this.createSourceList();
		}
		else{
			this.updateSourceList();
		}
	},
	{
		a_getFiles: function(){
			this.sendMyGroup("receiveFiles", this.data.contents);
		},

		a_newFile: function(){
			var name = "new File";

			var that = this;
			this.fs.writeFile(this.path + this.fs.path.sep + name, "", function(){
				that.newFile(name);
				// send back new structure
				that.a_getFiles();
				// tell client about new file - so it can select it for rename
				that.send("newFile", that.data.count);
			});
		},

		newFile: function(name){
			for(var i=0; i<this.data.contents.length; i++){
				if(this.data.contents[i].name == name){
					return this.data.contents[i];
				}
			}

			this.data.count++;
			var file = {
				name: name,
				id: this.data.count
			};
			this.data.contents.push(file);
			return file;
		},

		a_rename: function(d){
			this.rename(d.o, d.n);
		},

		rename: function(o, n, cb){
			console.log("RENAME:", o, n);
			
			this.project.db.move(this.fs.path.sep + this.name + o, this.fs.path.sep + this.name + n);
			this.fs.move(this.path + o, this.path + n, cb);
		},

		a_updateFolder: function(data){
			var f = this.getById(data.id);
			if(!f){
				return;
			}
			f.isClosed = data.isClosed;
			this.project.db.save();
		},

		a_uploadFile: function(data, cb){
			var path = data.path;
			var src = data.src;
			var name = path.split(this.fs.path.sep).pop();
			this.newFile(name);

			var that = this;
			this.fs.writeFile(this.path + path, new Buffer(src), function(){
				that.rename("/" + name, path, function(){
					that.project.db.save();
					// tell client about uploaded file
					that.a_getFiles();

					if(cb){
						cb();
					}
				});
			});

			//this.fs.writeFile(this.path + path+"raw", JSON.stringify(src));
		},

		a_newFolder: function(){
			this.data.count++;
			var name = "new Folder";
			this.data.contents.push({
				name: name,
				contents: [],
				id: this.data.count
			});
			var that = this;
			this.fs.mkdir(this.path + this.fs.path.sep + name, function(){
				that.a_getFiles();
				that.send("newFolder", that.data.count);
			});
		},
		a_save: function(data){
			var that = this;
			var dir = this.fs.path.resolve(this.path + data.path);
			if(dir.substring(0,this.path.length) != this.path ){
				MT.log("source:save, something wrong:", data);
				return;
			}

			var tmp = dir.split("/");
			tmp.pop();
			dir = tmp.join("/");
			this.fs.mkdir(dir, function(){
				that.fs.writeFile(that.path + data.path, data.src, function(e){
					that.project.db.save();
					that.project.export.phaser();
				});
			});
		},

		a_delete: function(data){
			var dir = this.fs.path.resolve(this.path + data.fullPath);
			if(dir.substring(0,this.path.length) != this.path ){
				MT.log("source:delete, something wrong:", data);
				return;
			}

			var item = this.delete(data.id);
			var that = this;
			this.fs.rm(this.path + data.fullPath, function(){
				that.a_getFiles();
			});
		},

		a_getContent: function(data){
			var that = this;
			this.fs.readFile(this.path + data.fullPath, function(err, content){
				if(err){
					data.src = "";
					that.send("fileContent", data);
					return;
				}
				data.src = content.toString("utf-8");

				that.send("fileContent", data);
			});

		},

		a_update: function(data){
			this.data.contents = data;
			this.project.db.save();
		},

		createSourceList: function(){
			var cont = this.data.contents;
			this.data.count = 0;
			var inc = 0;

			//reset all
			cont.length = 0;
			var that = this;
			this.fs.readdir(this.path, true, function(list){
				for(var i=0; i<list.length; i++){
					//skip hidden files
					if(list[i].name.substring(0, 1) == "."){
						continue;
					}
					cont[inc++] = list[i];
				}

				cont.sort(function(a, b){
					var ax = (a.contents ? -1 : 999999);
					var bx = (b.contents ? -1 : 999999);

					if(ax != bx){
						return ax - bx;
					}
					if(a.name > b.name){
						return 1;
					}
					if(a.name < b.name){
						return -1;
					}
					return 0;
				});

				that.rebuildIndex();
				that.project.db.save();
			});
		},

		updateSourceList: function(cb){
			var cont = this.data.contents;
			var that = this;

			this.fs.readdir(this.path, true, function(list){
				that._updateList(list, cont);

				that.rebuildIndex();
				that.project.db.save();
				if(cb){cb();}
			});
		},

		_updateList: function(list, cont){
			var found = false;
			// checking new
			for(var i=0; i<list.length; i++){
				//skip hidden files
				if(list[i].name.substring(0, 1) == "."){
					continue;
				}
				found = false;
				for(var j=0; j<cont.length; j++){
					if(cont[j].name != list[i].name){
						continue;
					}

					if(list[i].contents){
						this._updateList(list[i].contents, cont[j].contents);
					}

					found = true;
					break;
				}

				if(found){
					continue;
				}
				MT.log("new entry", list[i]);
				cont.push(list[i]);
			}

			// checking missing
			for(var j=0; j<cont.length; j++){
				found = false;
				for(var i=0; i<list.length; i++){
					if(list[i].name == cont[j].name){
						found = true;
						break;
					}
				}

				if(!found){
					cont.splice(j, 1);
					j--;
				}
			}
		},

		rebuildIndex: function(data, dirname){
			var src = dirname || "/";
			data = data || this.data;
			if(data.contents){
				for(var i=0; i<data.contents.length; i++){
					this.rebuildIndex(data.contents[i], src + data.contents[i].name);
				}
			}

			this.data.count++;
			data.id = this.data.count;
			data.fullPath = src;

			if(data == this.data){
				this.buildIdIndex();
			}
		},


		getId: function(path){
			for(var i in this.ids){
				if(this.ids[i].fullPath == path){
					return i;
				}
			}
			return null;
		},

		delete: function(id, data){
			var data = data || this.data.contents;
			var item = null;
			item = this._delete(id, data);
			if(item){
				if(item.contents){
					for(var i=0; i<item.contents.length; i++){
						if(this.delete(item.contents[i].id, item.contents)){
							i--;
						}
					}
				}
			}
			return item;
		},

		_delete: function(id, data){
			var ret = null;
			for(var i=0; i<data.length; i++){
				if(data[i].id == id){
					return data.splice(i, 1)[0];
				}
				if(data[i].contents){
					ret = this._delete(id, data[i].contents);
				}
			}
			return ret;
		},

		buildIdIndex: function(cont){
			cont = cont || this.data.contents;


			for(var i=0; i<cont.length; i++){
				if(cont[i].contents){
					this.buildIdIndex(cont[i].contents);
				}
				if(cont[i].id != void(0)){
					this.ids[cont[i].id] = cont[i];
				}
			}
		},

		getById: function(id){
			var ret = this.ids[id];
			if(!ret){
				MT.log("source editor: cannot find item ID", id);
			}
			return ret;
		}
	}
);
