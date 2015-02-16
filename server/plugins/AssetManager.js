MT.require("core.FS");
MT.requireFile(process.cwd() + "/../client/MT/core/Helper.js");

MT.extend("core.BasicPlugin")(
	MT.plugins.AssetManager = function(project){
		MT.core.BasicPlugin.call(this, project, "assets");
		this.ids = {};
		
		this.db = this.project.db.get(this.name);
		
		this.buildIdIndex();
		
		
		this.fs = MT.core.FS;
		
	},
	{
		a_sendFiles: function(){
			this.sendMyGroup("receiveFileList", this.db.contents);
		},
		
		a_newFolder: function(name){
			if(name == "" || name == "/"){
				return;
			}
			
			this.db.count++;
			
			name = name.split("\\").join("/");
			
			if(name.substring(0, 1) !== "/"){
				name = "/"+name;
			}
			
			var item = this.project.db.get(this.name + name);
			var iname = name.split("/").pop();
			
			item.name = iname;
			item.id = MT.core.Helper.uuid();
			
			this.project.db.save();
			this.a_sendFiles();
		},
		
		a_moveFile: function(files){
			this.project.db.move(this.name + files.a, this.name + files.b);
			this.project.db.save();
			this.a_sendFiles();
			this.project.export.phaser();
		},
		
		a_updateData: function(data){
			this.db.contents = data;
			this.project.db.save();
			this.sendMyGroup("receiveFileList", this.db.contents);
			
			this.project.export.phaser();
		},
		
		a_updateImage: function(data){
			var that = this;
			var asset = data.asset;
			var toUpdate = this.getById(asset.id);
			for(var i in asset){
				toUpdate[i] = asset[i];
			}
			this.fs.writeFile( this.project.path  + "/" + asset.__image, new Buffer(data.data, "binary"), function(e){
				that.a_sendFiles();
			});
		},
		
		a_addAtlas: function(data, cb){
			var that = this;
			var asset = this.getById(data.id);
			
			if(asset == void(0)){
				MT.log("Assets::addAtlas - failed to locate asset", data.id);
				return;
			}
			
			asset.atlas = data.id + "." + data.ext;
			this.fs.writeFile(this.project.path + "/" + asset.atlas , new Buffer(data.data, "binary"), function(e){
				that.project.db.save();
				that.a_sendFiles();
				if(cb){
					cb();
				}
			});
			
		},
		
		a_delete: function(id){
			this.delete(id);
			this.a_sendFiles();
			this.project.db.save();
			this.project.export.phaser();
		},
		
		delete: function(id, data){
			var data = data || this.db.contents;
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
				if(!item.contents){
					this.fs.rm(this.project.path + "/" + item.__image);
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
		
		a_newImage: function(data){
			var path = data.path.split("/");
			if(data.path != "/"){
				this.a_newFolder(this.fs.path.dirname(data.path));
			}
			
			var name = path.pop();
			var ext = name.split(".").pop();
			
			this.db.count++;
			var id = MT.core.Helper.uuid();
			var im = {
				__image: id + "." + ext,
				id: id
			};
			
			var p = this.project.path  + "/" + id+ "." + ext;
			
			
			var that = this;
			this.fs.writeFile(p, new Buffer(data.data), function(e){
				that.createImageObject(data, path, ext, im);
			});
			
			
		},
		
		createImageObject: function(data, path, ext, im){
			var p = path.join("/");
			var folder = this.project.db.get(this.name);
			
			if(path != ""){
				if(p.substring(0, 1) !== "/"){
					p = "/"+p;
				}
				folder = this.project.db.get(this.name + p );
			}
			
			
			for(var i in data){
				if(i == "data"){
					continue;
				}
				im[i] = data[i];
			}
			
			this.addItem(folder, im);
			this.buildIdIndex();
			
			this.a_sendFiles();
			this.project.export.phaser();
		},
		
		
		addItem: function(folder, data){
			folder.contents.push(data);
			this.project.db.save();
		},
		
		buildIdIndex: function(cont){
			cont = cont || this.db.contents;
			
			
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
			this.buildIdIndex();
			return this.ids[id];
		}
	}
);
