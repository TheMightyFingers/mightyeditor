MT.extend("core.BasicPlugin")(
	MT.plugins.MapEditor = function(project){
		MT.core.BasicPlugin.call(this, project, "map");
		
		this.data = this.project.db.get(this.name);
	},
	{
		readData: function(){
			this.a_sendData();
		},
		a_sendData: function(){
			this.sendMyGroup("receive", this.data.contents[0]);
		},
		
		a_updateData: function(data){
			this.data.contents[0] = data;
			this.project.db.save();
			this.a_sendData();
		}
	}
);
