MT.require("plugins.list");

MT.extend("core.BasicPlugin")(
	MT.plugins.Project = function(id){
		MT.core.BasicPlugin.call(this, "Project");
		this.id = id;
		
		this.plugins = {};
		
		for(var i in MT.plugins){
			if(i == "Project"){
				continue;
			}
			this.plugins[i.toLowerCase()] = new MT.plugins[i](this);
		}
		
		/*
		this.am = new MT.plugins.AssetsManager(this);
		this.om = new MT.plugins.ObjectsManager(this);
		this.map = new MT.plugins.MapEditor(this);
		this.settings = new MT.plugins.Settings(this);
		*/
		
		
		
		
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
			this.a_selectProject(pid);
			this.send("loadProject", pid);
		},
		
		initUI: function(ui){
			this.ui = ui;
			var that = this;
			
			var b = ui.topPanel.addButton("NEW", null, function(){
				that.newProject();
			});
			b.width = 80;
			
			for(var i in this.plugins){
				this.plugins[i].initUI(ui);
			}
			
			/*
			this.am.initUI(ui);
			this.om.initUI(ui);
			this.map.initUI(ui);
			
			this.settings.initUI(ui);
			*/
		},
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
			//this.am.initSocket(socket);
			//this.om.initSocket(socket);
			
			var pid = window.location.hash.substring(1);
			if(pid != ""){
				this.loadProject(pid);
			}
			else{
				this.newProject();
			}
			
			
			for(var i in this.plugins){
				this.plugins[i].initSocket(socket);
			}
			
			
		}
	}
);