MT.require("plugins.AssetsManager");
MT.require("plugins.ObjectsManager");
MT.require("plugins.MapEditor");
MT.require("plugins.Settings");

MT.extend("core.BasicPlugin")(
	MT.plugins.Project = function(id){
		MT.core.BasicPlugin.call(this, "Project");
		this.id = id;
		this.am = new MT.plugins.AssetsManager(this);
		this.om = new MT.plugins.ObjectsManager(this);
		this.map = new MT.plugins.MapEditor(this);
		this.settings = new MT.plugins.Settings(this);
		
		
		
		
		
	},
	{
		a_selectProject: function(id){
			this.id = id;
			window.location.hash = id;
			this.path = "data/projects/"+id;
		},
		
		
		newProject: function(){
			this.send("newProject");
		},
		
		loadProject: function(pid){
			this.id = pid;
			this.a_selectProject(pid);
			this.send("loadProject", pid);
		},
		
		initUI: function(ui){
			this.ui = ui;
			var that = this;
			
			var b = ui.topPanel.addButton("NEW", null, function(){
				console.log("NEW project");
				that.newProject();
			});
			b.width = 80;
			
			
			this.am.initUI(ui);
			this.om.initUI(ui);
			this.map.initUI(ui);
			
			this.settings.initUI(ui);
		},
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
			this.am.initSocket(socket);
			this.om.initSocket(socket);
			
			var pid = window.location.hash.substring(1);
			if(pid != ""){
				this.loadProject(pid);
			}
			else{
				this.newProject();
			}
			
			
		}
	}
);