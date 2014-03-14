MT.require("core.FS");

MT(
	MT.core.JsonDB = function(file, onReady){
		this.dbfile = file;
		this.fs = MT.core.FS;
		this.readData(onReady);
		
	},
	{
		readData: function(cb){
			var that = this;
			this.fs.readFile(this.dbfile, function(err, contents){
				if(err){
					that.data = {};
				}
				else{
					that.data = JSON.parse(contents);
				}
				if(typeof cb === "function"){
					cb();
				}
			});
			
		},
   
		saveData: function(data, cb){
			this.fs.writeFile(this.dbfile, JSON.stringify(data), function(){
				console.log("saved data", data);
				that.a_sendData();
			});
		}

	}
);