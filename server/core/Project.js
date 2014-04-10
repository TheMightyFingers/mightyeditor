MT.require("plugins.AssetsManager");
MT.require("plugins.ObjectsManager");
MT.require("plugins.Export");
MT.require("plugins.MapEditor");

MT.require("core.JsonDB");

MT.extend("core.SocketManager")(
	MT.core.Project = function(socket){
		var that = this;
		
		MT.core.SocketManager.call(this, socket, "Project");
		
		
		this.root = "../client/data/projects";
		
		
		
	},
	{
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
		
		
		loadData: function(data){
			this.db = data;
			this.loadPlugins();
			
		},
		
		loadPlugins: function(){
			this.assets = new MT.plugins.AssetsManager(this.socket, this);
			this.objects = new MT.plugins.ObjectsManager(this.socket, this);
			this.export = new MT.plugins.Export(this.socket, this);
			this.map = new MT.plugins.MapEditor(this.socket, this);
		},
		
		openProject: function(pid){
			console.log("OPENED project");
			var that = this;
			that.id = pid;
			that.path = that.root + "/" + that.id;
			
			new MT.core.JsonDB(that.path + "/JsonDB.json", function(data){
				that.loadData(data);
			
				
				that.socket.leaveAllGroups();
				that.socket.joinGroup(that.id);
				
				that.assets.a_sendFiles(that.path);
				that.objects.readData();
				
				that.map.readData();
				
				
			});
			
		},
		
		
		
		createProject: function(){
			this.id = this.makeID(this.knownProjects.length);
			this.path = this.root + "/" + this.id;
			
			var that = this;
			MT.core.FS.mkdir(this.path, function(){
				that.openProject(that.id);
				that.send("selectProject", that.id);
			});
		},
		
		getAllProjects: function(path, cb){
			MT.core.FS.readdir(path, false, cb);
		},
		
		makeID: function(num){
			return "p"+(10000+num).toString(36);
		}
		
	}
);