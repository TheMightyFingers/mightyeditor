MT.require("plugins.AssetsManager");
MT.require("plugins.ObjectsManager");
MT.require("core.JsonDB");

MT.extend("core.SocketManager")(
	MT.Project = function(socket){
		MT.core.SocketManager.call(this, socket, "Project");
		
		this.assets = new MT.plugins.AssetsManager(socket, this);
		this.objects = new MT.plugins.ObjectsManager(socket, this);
		
		console.log(this.objects);
		
		this.db = new MT.core.JsonDB("data/JsonDB.json");
		
		this.root = "../client/data/projects";
		
		var that = this;
		
		
	},
	{
		openProject: function(pid){
			console.log("OPENED project");
			this.id = pid;
			this.path = this.root + "/" + this.id;
			this.socket.leaveAllGroups();
			this.socket.joinGroup(this.id);
			
			this.assets.a_sendFiles(this.path);
			this.objects.updateData();
		},
		
		a_newProject: function(){
			var that = this;
			
			this.getAllProjects(this.root, function(data){
				that.knownProjects = data;
				that.createProject(data);
			});
		},
		a_loadProject: function(id){
			console.log("loading Project", id);
			this.openProject(id);
		},
		
		createProject: function(){
			this.id = this.makeID(this.knownProjects.length);
			this.path = this.root + "/" + this.id;
			
			MT.core.FS.mkdir(this.path);
			
			this.send("selectProject", this.id);
		},
		
		getAllProjects: function(path, cb){
			MT.core.FS.readdir(path, false, cb);
		},
		
		makeID: function(num){
			return "p"+(10000+num).toString(36);
		}
	}
);