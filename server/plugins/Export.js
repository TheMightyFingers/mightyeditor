MT.require("core.FS");


var exec = require('child_process').exec;

MT.extend("core.BasicPlugin")(
	MT.plugins.Export = function(project){
		MT.core.BasicPlugin.call(this, project, "Export");
		
		this.fs = MT.core.FS;
		
		this.zipName = "mightytools.zip";
		this.phaserSrc = "phaser.js";
		this.phaserMinSrc = "phaser.min.js";
		
		this.importFile = "mt.import.js";
		this.dataFile = "mt.data.js";
		this.jsonFile = "mt.data.json";
		this.exampleFile = "example.html";
		this.hacksFile = "phaserHacks.js";
		
		
		this.phaserPath = "phaser";
		this.assetsPath = "assets";
		
		this.sep = this.fs.path.sep;
		
		this.idList = {};
	},
	{
		a_phaserDataOnly: function(){
			var that = this;
			this.dir = this.project.path + this.sep + this.phaserPath;
			

			this.phaserDataOnly(function(err, localFilePath, filePath){
				that.send("complete",{
					file: localFilePath,
					action: "phaserDataOnly"
				});
			});
			
			
		},
		
		
		_cleanUp: function(o){

			delete o.__image;
			delete o.source;
			delete o.path;
			delete o.tmpName;
			delete o._framesCount;
		},
		
		phaserDataOnly: function(cb, contents){
			var that = this;
			
			this.dir = this.project.path + this.sep + this.phaserPath;
			
			this.fs.mkdir(this.dir);
			var data;
			if(contents == void(0)){
				data = JSON.parse(JSON.stringify({
					assets: this.project.db.get("assets"),
					objects: this.project.db.get("objects"),
					map: this.project.db.get("map").contents[0]
				}, null, "\t"));
			}
			else{
				data = contents;
			}
			
			
			this.createIdList(data.assets.contents, this.dir + this.sep + this.assetsPath);
			this.parseObjects(data.objects.contents);
			
			
			var filePath = this.dir + this.sep + this.dataFile;
			var localFilePath = this.phaserPath + this.sep + this.dataFile;
			
			
			contents = JSON.stringify(data, null, "\t");
			
			this.fs.writeFile(this.dir + this.sep + this.jsonFile, contents);
			this.fs.copy("phaser/mt.export.js", this.dir + this.sep + this.importFile);
			
			this.fs.copy("phaser" + this.sep + this.phaserSrc, this.dir + this.sep + this.phaserSrc);
			this.fs.copy("phaser" + this.sep + this.phaserSrc, this.dir + this.sep + this.phaserMinSrc);
			this.fs.copy("phaser" + this.sep + this.exampleFile, this.dir + this.sep + this.exampleFile);
			this.fs.copy("phaser" + this.sep + this.hacksFile, this.dir + this.sep + this.hacksFile);
			
			
			
			this.fs.writeFile(filePath, "window.mt = window.mt || {}; window.mt.data = "+contents+";\r\n", function(err){
				if(cb){
					cb(err, localFilePath, filePath);
				}
			});
			
		},
		
		a_phaser: function(){
			var that = this;
			
			this.dir = this.project.path + this.sep + this.phaserPath;
			this.fs.rmdir(this.dir);
			this.fs.rm(this.project.path + this.sep +  this.zipName);
			
			
			this.fs.mkdir(this.dir);
			this.fs.mkdir(this.dir + this.sep + this.assetsPath);
			
			this.phaser(function(error, stdout, stderr){
				MT.log("Export::exec", error, stdout, stderr);
				that.send("complete", {
					file:  that.zipName,
					action: "phaser"
				});
			});
			
		},
		
		phaser: function(cb){
			
			var that = this;
			
			this.dir = this.project.path + this.sep + this.phaserPath;
			this.fs.mkdir(this.dir);
			
			
			
			this.assets = JSON.parse( JSON.stringify(this.project.db.get("assets")) );
			this.objects = JSON.parse( JSON.stringify(this.project.db.get("objects")) );
			
			if(this.project.db.get("map").contents && this.project.db.get("map").contents.length > 0){
				this.map = JSON.parse( JSON.stringify(this.project.db.get("map").contents[0]) );
			}
			else{
				this.map = {};
			}
			
			
			this.parseAssets(this.assets.contents);
			
			var contents = {
					assets: this.assets,
					objects: this.objects,
					map: this.map
			};
			
			this.phaserDataOnly(function(err, local, pub){
				
				//zip -9 -r <zip file> <folder name>
				exec("zip -9 -r ../" + that.zipName + " ./", { cwd: that.dir }, cb);
				
			}, contents);
		},
		
		createIdList: function(assets, path){
			path = path || this.project.path;
			var asset = null;
			for(var i=0; i<assets.length; i++){
				asset = assets[i];
				
				if(asset.contents){
					this.createIdList(asset.contents, path + asset.name);
					
					this._cleanUp(asset);
					continue;
				}
				
				this._cleanUp(asset);
				this.idList[asset.id] = asset.key;
			}
		},
		
		parseAssets: function(assets, path){
			path = path || this.dir + this.sep + this.assetsPath;
			this.fs.mkdir(path);
			
			var asset = null;
			for(var i=0; i<assets.length; i++){
				asset = assets[i];
				
				if(asset.contents){
					if(!asset.name || asset.name == "NaN"){
						MT.log("unknow name", asset);
						continue;
					}
					this.parseAssets(asset.contents, path + this.sep + asset.name);
					continue;
				}
				
				asset.source = path + this.sep + asset.name;
				this.fs.copy(this.project.path + this.sep + asset.__image, asset.source);
				if(asset.atlas){
					var aext = asset.atlas.split(".").pop();
					this.fs.copy(this.project.path + this.sep + asset.atlas, asset.source + "." + aext);
					asset.atlas = asset.name + "." + aext;
				}
			}
		},
		
		parseObjects: function(objects){
			var object = null;
			var tmp = null;
			
			for(var i=0; i<objects.length; i++){
				object = objects[i];
				if(object.contents){
					this._cleanUp(object);
					this.parseObjects(object.contents);
					continue;
				}
				
				object.assetKey = this.idList[object.assetId];
				
				this._cleanUp(object);
			}
			
		}

	}
);