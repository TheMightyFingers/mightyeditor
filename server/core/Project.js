MT.require("plugins.AssetsManager");
MT.require("plugins.ObjectsManager");
MT.require("plugins.Export");
MT.require("plugins.MapEditor");

MT.require("core.JsonDB");
MT.require("core.FS");

MT.extend("core.SocketManager")(
	MT.core.Project = function(socket){
		var that = this;
		
		MT.core.SocketManager.call(this, socket, "Project");
		
		this.root = "../client/data/projects";
		
		this.fs = MT.core.FS;
		
		this.dbObject  = null;
		
		socket.onClose(function(){
			if(that.db){
				that.db.close();
			}
		});
		
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
			var idr = id.split("-");
			var that = this;
			if(idr.length == 1){
				this.openProject(id, function(){
					that.send("selectProject", that.id);
				});
				return;
			}
			this.loadCommand(idr[0], idr[1]);
		},
		
		
		loadCommand: function(projectId, command){
			var that = this;
			
			if(command == "copy"){
				this.getAllProjects(this.root, function(data){
					that.knownProjects = data;
					that.exec_copy(projectId);
				});
				return;
			}
			
			MT.log("unsupported command", command);
		},
		
		exec_copy: function(projectId){
			this.id = this.makeID(this.knownProjects.length);
			var that = this;
			this.fs.copy(this.root + "/" + projectId, this.root + "/" + this.id, function(){
				that.openProject(that.id, function(){
					that.send("selectProject", that.id);
				});
			});
			
		},
		
		loadData: function(data){
			this.db = data;
			this.loadPlugins();
			
		},
		
		loadPlugins: function(){
			this.export = new MT.plugins.Export(this.socket, this);
			
			this.assets = new MT.plugins.AssetsManager(this.socket, this);
			this.objects = new MT.plugins.ObjectsManager(this.socket, this);
			
			this.map = new MT.plugins.MapEditor(this.socket, this);
		},
		
		openProject: function(pid, cb){
			var that = this;
			that.path = that.root + MT.core.FS.path.sep + pid;
			
			this.fs.fs.exists(this.path, function(yes){
				if(!yes){
					that.a_newProject();
					return;
				}
				
				that.id = pid;
				new MT.core.JsonDB(that.path + "/JsonDB.json", function(data){
					that.loadData(data);
					
					
					that.socket.leaveAllGroups();
					that.socket.joinGroup(that.id);
					
					if(typeof cb == "function"){
						cb();
					}
					
					that.assets.a_sendFiles(that.path);
					that.objects.readData();
					that.map.readData();
				});
			});
		},
		
		
		
		createProject: function(){
			this.id = this.makeID(this.knownProjects.length);
			this.path = this.root + MT.core.FS.path.sep + this.id;
			
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