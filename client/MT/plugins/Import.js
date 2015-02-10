MT.extend("core.Emitter").extend("core.BasicPlugin")(
	MT.plugins.Import = function(project){
		MT.core.BasicPlugin.call(this, "Import");
		this.project = project;
	},
	{}
);