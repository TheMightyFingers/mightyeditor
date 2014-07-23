MT.require("core.FS");


MT.extend("core.BasicPlugin")(
	MT.plugins.SourceEditor = function(project){
		MT.core.BasicPlugin.call(this, project, "sourceeditor");
		this.ids = {};
		
		this.db = this.project.db.get(this.name);
		this.fs = MT.core.FS;
	},
	{
		a_getFiles: function(){
			this.sendMyGroup("receiveFileList", this.db.contents);
		},
		
		a_newFolder: function(name){
			
		}
	}
);