MT.require("core.FS");


MT.extend("core.BasicPlugin")(
	MT.plugins.SourceEditor = function(project){
		MT.core.BasicPlugin.call(this, project, "source");
		this.ids = {};
		
		this.db = this.project.db.get(this.name);
		this.fs = MT.core.FS;
		this.source = "src";
		this.path = this.project.path + this.fs.path.sep + this.source;
		/*
		if(this.db.contents.length === 0){
			
		}
		*/
		this.createSourceList();
	},
	{
		a_getFiles: function(){
			this.sendMyGroup("receiveFiles", this.db.contents);
		},
		
		a_newFolder: function(name){
			
		},
		
		a_newFile: function(name){
			
		},
		
		a_save: function(data){
			this.fs.writeFile(this.path + data.fullPath, data.src);
		},
		
		a_getContent: function(data){
			var that = this;
			console.log("content", data.fullPath);
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
		
		createSourceList: function(){
			var cont = this.db.contents;
			var inc = 0;
			
			//reset all
			cont.length = 0;
			
			this.fs.readdir(this.path, true, function(list){
				for(var i=0; i<list.length; i++){
					//skip hidden files
					if(list[i].name.substring(0, 1) == "."){
						continue;
					}
					cont[inc++] = list[i];
				}
				
				cont.sort(function(a, b){
					var ax = (a.contents ? 0 : 999999);
					var bx = (b.contents ? 0 : 999999);
					
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
			});
		}
	}
);