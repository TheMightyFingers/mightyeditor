MT.require("plugins.list");
MT.require("core.keys");

MT.extend("core.BasicPlugin")(
	MT.core.Project = function(ui, socket){
		MT.core.BasicPlugin.call(this, "Project");
		
		window.pp = this;
		
		this.plugins = {};
		
		this.pluginsEnabled = [
			"AssetsManager",
			"ObjectsManager",
			"MapEditor",
			"Settings",
			"Export",
			"Tools",
			"UndoRedo",
			"DataLink",
			"Analytics"
		];
		
		for(var id=0, i=""; id<this.pluginsEnabled.length; id++){
			i = this.pluginsEnabled[id];
			this.plugins[i.toLowerCase()] = new MT.plugins[i](this);
		}
		
		
		this.am = this.plugins.assetsmanager;
		this.om = this.plugins.objectsmanager;
		this.map = this.plugins.mapeditor;
		this.settings = this.plugins.settings;
		
		this.initUI(ui);
		this.initSocket(socket);
		
	},
	{
		a_selectProject: function(id){
			this.id = id;
			window.location.hash = id;
			this.path = "data/projects/"+id;
			
			this.initPlugins();
		},
		
		
		newProject: function(){
			this.send("newProject");
		},
		
		loadProject: function(pid){
			this.send("loadProject", pid);
		},
		
		initUI: function(ui){
			this.ui = ui;
			var that = this;
			
			var b = ui.topPanel.addButton("NEW", null, function(){
				window.location = window.location.toString().split("#")[0];
			});
			b.width = 80;
			
			var b = ui.topPanel.addButton("CLONE", null, function(){
				window.location = window.location.toString()+"-copy";
				window.location.reload();
			});
			b.width = 80;
			/*
			this.am.initUI(ui);
			this.om.initUI(ui);
			this.map.initUI(ui);
			
			this.settings.initUI(ui);
			*/
		},
		
		initPlugins: function(){
			
			for(var i in this.plugins){
				this.plugins[i].initUI(this.ui);
			}
			
			
			for(var i in this.plugins){
				if(this.plugins[i].installUI){
					this.plugins[i].installUI(this.ui);
				}
			}
			
			for(var i in this.plugins){
				if(this.plugins[i].initSocket){
					this.plugins[i].initSocket(this.socket);
				}
			}
		},
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
			
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