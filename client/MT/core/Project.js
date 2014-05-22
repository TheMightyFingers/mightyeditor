MT.require("plugins.list");
MT.require("core.keys");
MT.require("ui.Popup");

MT.require("plugins.HelpAndSupport");
MT.require("plugins.FontManager");

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
			"Analytics",
			"HelpAndSupport",
			"FontManager"
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
		a_maintenance: function(data){
			var seconds = data.seconds;
			var content = "System will go down for maintenance in ";
			var desc = "<p>All your current work in progress has been saved.</p><p>Please wait. Editor will reload automatically.</p>";
			
			if(data.type == "new"){
				content = "System is being maintained. Will be back in ";
				desc = "<p>Please wait. Editor will reload automatically.</p>";
			}
			
			
			var pop = new MT.ui.Popup("Maintenance", content + '<span style="color: red">' + seconds +"</span> seconds." + desc);
			
			var int = window.setInterval(function(){
				seconds--;
				if(seconds < 0){
					window.clearInterval(int);
					return;
				}
				pop.content.innerHTML = content + '<span style="color: red">' + seconds +"</span> seconds." + desc;
			}, 1000);
			
			
		},
		
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
			
			var b = ui.topPanel.addButton("New", null, function(){
				window.location = window.location.toString().split("#")[0];
			});
			b.width = 80;
			
			var b = ui.topPanel.addButton("Clone", null, function(){
				window.location = window.location.toString()+"-copy";
				window.location.reload();
			});
			b.width = 80;
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
			
			
			//delay a little bit so browesr can parse css and align before we call start to calculate
			var that = this;
			window.setTimeout(function(){
				that.ui.resize();
			}, 100);
			
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