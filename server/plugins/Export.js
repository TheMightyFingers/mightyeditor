MT.require("core.FS");


var exec = require('child_process').exec;

MT.extend("core.BasicPlugin")(
	MT.plugins.Export = function(project){
		MT.core.BasicPlugin.call(this, project, "Export");
		
		this.fs = MT.core.FS;
		
		this.zipName = "mightytools.zip";
		this.phaserSrc = "phaser.js";
		this.phaserMinSrc = "phaser.min.js";
		
		this.importFile = "mt.helper.js";
		this.dataFile = "mt.data.js";
		this.jsonFile = "mt.data.json";
		this.exampleFile = "index.html";
		this.hacksFiles = ["phaserHacks2.0.7.js", "phaserHacks2.1.3.js", "phaserHacks.js"];
		
		
		this.phaserPath = "phaser";
		this.assetsPath = "assets";
		
		this.sep = this.fs.path.sep;
		this.dir = this.project.path + this.sep + this.phaserPath;
		
		this.idList = {};
	},
	{
		a_phaserDataOnly: function(){
			var that = this;
			
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
			
			this.parseAssets(data.assets.contents);
			this.parseObjects(data.objects.contents);
			
			contents = JSON.stringify(data, null, "\t");
			
			var srcPath = this.dir + this.sep;
			var libsPath = srcPath + "js/lib/";
			var tplPath = "templates/default/src/js/lib/";
			var localFilePath = "phaser/js/lib/" +  this.dataFile;
			var filePath = libsPath + this.dataFile;
			
			that.fs.copy(this.project.path + this.sep + "src", this.dir);
			
			
			that.fs.copy(tplPath + this.importFile, libsPath + this.importFile);
			
			for(var i=0; i<this.hacksFiles.length; i++){
				that.fs.copy(tplPath + this.hacksFiles[i], libsPath + this.hacksFiles[i]);
			}
			
			that.fs.writeFile(libsPath + this.jsonFile, contents);
			that.fs.writeFile(libsPath + this.dataFile, "window.mt = window.mt || {}; window.mt.data = "+contents+";\r\n", function(err){
				if(cb){
					cb(err, localFilePath, filePath);
				}
			});
		},
		
		
		copyData: function(data, path, num, cb){
			num = num || 0;
			
			var scanAgain = [];
			
			for(var i=0; i<data.length; i++){
				if(data[i].contents){
					scanAgain.push(data[i].contents);
					continue;
				}
				
				num++;
				this.copyFile(data[i], path, function(){
					num--;
					if(num == 0){
						cb();
					}
				});
			}
			
			for(var i=0; i<scanAgain.length; i++){
				this.createSources(scanAgain[i], info, num, cb);
			}
		},
		
		copyFile: function(info, path, cb){
			
			
		},
		
		
		a_phaser: function(){
			var that = this;
			this.fs.rmdir(this.dir);
			this.fs.rm(this.project.path + this.sep +  this.zipName);
			
			
			this.fs.mkdir(this.dir);
			this.fs.mkdir(this.dir + this.sep + this.assetsPath);
			
			this.phaser(function(error, stdout, stderr){
				//MT.log("Export::exec", error, stdout, stderr);
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
				if(asset.__image){
					this.fs.copy(this.project.path + this.sep + asset.__image, asset.source);
				}
				if(asset.atlas){
					var aext = asset.atlas.split(".").pop();
					this.fs.copy(this.project.path + this.sep + asset.id + "." + aext, asset.source + "." + aext);
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
					this.parseObjects(object.contents);
					object.assetKey = this.idList[object.assetId];
					this._cleanUp(object);
					continue;
				}
				
				object.assetKey = this.idList[object.assetId];
				
				this._cleanUp(object);
			}
			
		}

	}
);
