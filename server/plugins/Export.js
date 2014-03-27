MT.require("core.FS");


var exec = require('child_process').exec;

MT.extend("core.SocketManager")(
	MT.plugins.Export = function(socket, project){
		MT.core.SocketManager.call(this, socket, "Export");
		this.project = project;
		this.fs = MT.core.FS;
		
		this.zipName = "mightytools.zip";
		this.phaserFile = "mt.js";
		
	},
	{
		a_phaser: function(){
			var that = this;
			
			this.assets = this.project.db.get("assets");
			this.objects = this.project.db.get("objects");
			
			
			
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
			
			this.fs.writeFile(this.dir + "/" + this.phaserFile, JSON.stringify({
				assets: this.assets,
				objects: this.objects
			}, null, "\t"), function(err){
				console.log("write done", err);
				
				//zip -9 -r <zip file> <folder name>
				exec("zip -9 -r ../" + that.zipName + " ./",{
						cwd: that.dir
					},function (error, stdout, stderr) {
					
					console.log("exec", error, stdout, stderr);
					
					//console.log("EXPORT", this.assets, this.objects);
					that.send("complete","mightytools.zip");
					
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
				
				this.fs.copy(this.project.path + "/" + asset.__image, path + "/" + asset.name);
			}
		}

	}
);