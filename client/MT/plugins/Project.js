MT.extend("core.BasicPlugin")(
	MT.plugins.Project = function(id){
		MT.core.BasicPlugin.call(this, "Project");
		
		this.id = id;
		
		
		this.am = new MT.plugins.AssetsManager();
		
		
		
		
	},
	{
		newProject: function(){
			this.send("newProject");
		},
		
		setProject: function(projectId){
			this.id = projectId;
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
		},
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
			this.am.initSocket(socket);
			
			var pid = window.location.pathname.substring(1);
			if(pid != ""){
				this.send("loadProject", pid);
			}
			else{
				console.log("new Project");
				this.send("newProject");
			}
			
			
		}
	}
);