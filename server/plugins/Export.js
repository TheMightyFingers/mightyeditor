MT.require("core.FS");


var exec = require('child_process').exec;

MT.extend("core.SocketManager")(
	MT.plugins.Export = function(socket, project){
		MT.core.SocketManager.call(this, socket, "Export");
		this.project = project;
		this.fs = MT.core.FS;
		
		this.zipName = "mightytools.zip";
		this.phaserSrc = "phaser.js";
		
		this.importFile = "mt.import.js";
		this.dataFile = "mt.data.js";
		
		this.idList = {};
	},
	{
		a_phaserDataOnly: function(){
			var that = this;
			this.assets = this.project.db.get("assets");
			this.objects = this.project.db.get("objects");
			this.map = this.project.db.get("map").contents[0];
			
			this.dir = this.project.path + "/tmp";
			
			this.fs.rmdir(this.dir, function(){
				console.log("export removed tmp");
			});
			this.fs.mkdir(this.dir);
			
			
			var contents = "mt.data = " + JSON.stringify({
					assets: that.assets,
					objects: that.objects,
					map: that.map
				}, null, "\t")+";\r\n";
				
			this.fs.writeFile(this.dir + "/" + this.dataFile, contents, function(err){
				
				console.log(err);
				
				that.send("complete",{
					file: "tmp/" + that.dataFile,
					action: "phaserDataOnly"
				});
			});
			
			
		},
		
		a_phaser: function(){
			var that = this;
			
			this.assets = this.project.db.get("assets");
			this.objects = this.project.db.get("objects");
			this.map = this.project.db.get("map").contents[0];
			
			
			this.dir = this.project.path + "/tmp";
			
			this.fs.rmdir(this.dir, function(){
				console.log("export removed tmp");
			});
// 
			this.fs.mkdir(this.dir);
			this.fs.mkdir(this.dir + "/assets");
			
			this.fs.rm(this.project.path + "/" + this.zipName);
			
			
			console.log(this.assets,this.assets.contents);
			
			this.parseAssets(this.assets.contents, this.dir + "/assets");
			this.parseObjects(this.objects.contents);
			
			
			this.fs.copy("phaser/" + this.phaserSrc, this.dir + "/" + this.phaserSrc);
			this.fs.copy("phaser/example.html", this.dir + "/example.html");
			
			
			var contents = "";
			this.fs.readFile("phaser/mt.export.js", function(e, c){
				
				that.fs.writeFile(that.dir + "/" + that.importFile, c);
				
				contents = "mt.data = "+JSON.stringify({
					assets: that.assets,
					objects: that.objects,
					map: that.map
				}, null, "\t")+";\r\n";
				
				that.fs.writeFile(that.dir + "/" + that.dataFile, contents, function(err){
					console.log("write done", err);
					
					//zip -9 -r <zip file> <folder name>
					exec("zip -9 -r ../" + that.zipName + " ./",{
							cwd: that.dir
						},function (error, stdout, stderr) {
						
						console.log("exec", error, stdout, stderr);
						
						//console.log("EXPORT", this.assets, this.objects);
						that.send("complete",{
							file:  that.zipName,
							action: "phaser"
						});
						
					});
					
				});
			});
		},
		
		parseAssets: function(assets, path){
			path = path || this.project.path;
			var asset = null;
			for(var i=0; i<assets.length; i++){
				asset = assets[i];
				
				if(asset.contents){
					this.fs.mkdir(path + "/" +asset.name);
					this.parseAssets(asset.contents, path + "/" +asset.name);
					continue;
				}
				
				asset.source = path + "/" + asset.name;
				
				this.fs.copy(this.project.path + "/" + asset.__image, path + "/" + asset.name);
				
				
				this.idList[asset.id] = asset.path;
			}
		},
		
		parseObjects: function(objects){
			var object = null;
			var tmp = null;
			
			for(var i=0; i<objects.length; i++){
				object = objects[i];
				if(object.contents){
					this.parseObjects(object.contents);
					continue;
				}
				
				assetId = object.__image.split(".")[0];
				object.assetPath = this.idList[assetId];
			}
			
		}

	}
);