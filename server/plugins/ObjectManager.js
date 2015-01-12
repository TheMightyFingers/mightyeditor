MT.require("core.FS");

MT.extend("core.BasicPlugin")(
	MT.plugins.ObjectManager = function(project){
		MT.core.BasicPlugin.call(this, project, "om");
		
		this.fs = MT.core.FS;
		
		this.data = this.project.db.get("objects");
		this.hashTable = {};
	},
	{
		readData: function(){
			this.buildHasTable();
			this.a_sendData();
		},
		buildHasTable: function(data){
			data = data || this.data.contents;
			for(var i=0; i<data.length; i++){
				this.hashTable[data[i].id] = data[i];
				if(data[i].contents){
					this.buildHasTable(data[i].contents);
				}
			}
		},
		
		a_sendData: function(){
			this.sendMyGroup("receive", this.data.contents);
		},
		
		a_save: function(data){
			if(this.hashTable[data.id]){
				for(var key in data){
					this.hashTable[data.id][key] = data[key];
				}
				if(data.contents){
					this.updateData(data.contents);
				}
			}
			else{
				this.hashTable[data.id] = data;
			}
			this.saveAndSync();
		},
		
		a_updateData: function(data){
			this.data.contents = data;
			this.buildHasTable();
			
			this.addIndices(data);
			this.saveAndSync();
		},
		
		updateData: function(data){
			for(var i=0; i<data.length; i++){
				this.a_save(data[i]);
				if(data[i].contents){
					this.updateData(data[i].contents);
				}
			}
		},
		
		saveAndSync: function(){
			this.project.db.save();
			this.project.export.phaserDataOnly();
			//this.a_sendData();
		},
		
		addIndices: function(data){
			
			for(var i=0; i<data.length; i++){
				if(data[i].id == void(0)){
					this.data.count++;
					data[i].id = this.data.count;
				}
				if(data[i].contents){
					this.addIndices(data[i].contents);
					continue;
				}
			}
		}
	}
);
