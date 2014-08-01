MT.require("plugins.AssetManager");
MT.require("plugins.ObjectManager");
MT.require("plugins.Export");
MT.require("plugins.MapEditor");
MT.require("plugins.SourceEditor");

MT.require("core.JsonDB");
MT.require("core.FS");

MT.extend("core.BasicPlugin")(
	MT.core.Project = function(socket){
		this.socket = socket;
		
		MT.core.BasicPlugin.call(this, this, "Project");
		
		
		this.root = "../client/data/projects";
		this.fs = MT.core.FS;
		this.dbObject  = null;
		this.dbName = ".db.json";
		
		
		var that = this;
		socket.onClose(function(){
			if(that.db){
				that.db.close();
			}
		});
		
	},
	{
		a_newProject: function(projectInfo){
			var that = this;
			this.getAllProjects(this.root, function(data){
				that.knownProjects = data;
				that.createProject(projectInfo);
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
		
		a_updateProject: function(info){
			this.updateProject(info);
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
		
		saveProjectInfo: function(info){
			this.data.contents[0] = info;
		},
		
		getProjectInfo: function(info){
			return this.data.contents[0];
		},
		
		loadData: function(db){
			this.db = db;
			this.data = this.db.get(this.name);
		},
		
		loadPlugins: function(){
			this.export = new MT.plugins.Export(this);
			
			this.assets = new MT.plugins.AssetManager(this);
			this.objects = new MT.plugins.ObjectManager(this);
			
			this.map = new MT.plugins.MapEditor(this);
			
			this.sourceeditor = new MT.plugins.SourceEditor(this);
		},
		
		openProject: function(pid, cb){
			var that = this;
			that.path = that.root + MT.core.FS.path.sep + pid;
			
			
			this.fs.exists(this.path, function(yes){
				if(!yes){
					that.send("newProject");
					return;
				}
				
				that.id = pid;
				
				
				/* fallback for old objects */
				that.fs.exists(that.path + that.fs.path.sep + that.dbName, function(yes){
					if(yes){
						new MT.core.JsonDB(that.path + that.fs.path.sep + that.dbName, function(data){
							that.onDbReady(data, cb);
						});
						return;
					}
					
					that.fs.exists(that.path + "/JsonDB.json", function(yes){
						if(yes){
							that.fs.copy(that.path + "/JsonDB.json", that.path + that.fs.path.sep + that.dbName);
							that.fs.rm(that.path + "/JsonDB.json", function(){
								new MT.core.JsonDB(that.path + that.fs.path.sep + that.dbName, function(data){
									that.onDbReady(data, cb);
								});
							});
							return;
						}
						
						new MT.core.JsonDB(that.path + that.fs.path.sep + that.dbName, function(data){
							that.onDbReady(data, cb);
						});
					});
				});
			});
		},
		
		// here cb tells brwser to open project
		// we will skip cb here for older projects
		// a little bit tricky - may break thinkgs in the future
		onDbReady: function(db, cb){
			this.loadData(db);
			
			if(!this.getProjectInfo() && !this.isNewProject){
				this.isNewProject = false;
				this.send("needUpdate");
				return;
			}
			this.initProject(cb);
		},
		
		initProject: function(cb){
			
			console.log("load plugins");
			
			this.loadPlugins();
			this.socket.leaveAllGroups();
			this.socket.joinGroup(this.id);
			
			if(typeof cb == "function"){
				cb();
			}
			
			this.assets.a_sendFiles(this.path);
			this.objects.readData();
			this.map.readData();
		},
		isNewProject: false,
		createProject: function(info){
			this.isNewProject = true;
			this.id = this.makeID(this.knownProjects.length);
			this.path = this.root + MT.core.FS.path.sep + this.id;
			
			this.checkNs(info);
			
			
			
			var atLast = function(){
				that.addCommonFiles(info);
			};
			var that = this;
			this.fs.mkdir(this.path, function(){
				that.fs.readdir("templates/default", true, function(data){
					that.createSources(data, info, 0, atLast);
				});
			});
			
		},
		
		updateProject: function(info){
			this.checkNs(info);
			var atLast = function(){
				
				that.saveProjectInfo(info);
				that.initProject(function(){
					that.send("selectProject", that.id);
				});
			};
			
			var that = this;
			this.fs.mkdir(this.path + this.fs.path.sep + "src", function(){
				that.fs.readdir("templates/default/src", true, function(data){
					that.createSources(data, info, 0, atLast);
				});
			});
		},
		
		checkNs: function(info){
			// probably should check this in client
			// check some reserved words
			if("Phaser, PIXI, mt, window".indexOf(info.namespace) > -1){
				info.namespace += "2";
			}
			info.reg = {};
			var s = "";
			for(var i in info){
				s = "%"+i+"%"
				info.reg[i] = new RegExp(s, "g");
			}
				
			if(this.isValidVarName(info.namespace)){
				// add window.ns instead of window["ns"]
				info.reg.namespace = new RegExp('\\["%namespace%"]', "g");
				info.isValid = true;
			}
		},
		isValidVarName: function(name){
			name = name.replace(/\W/g, '');
			// TODO: fix this - remove eval
			try{
				eval("var "+name+" = 5;");
			}
			catch(e){
				return false;
			}
			return true;
		},
		
		
		createSources: function(data, info, num, cb){
			num = num || 0;
			
			var scanAgain = [];
			
			for(var i=0; i<data.length; i++){
				if(data[i].contents){
					scanAgain.push(data[i].contents);
					continue;
				}
				num++;
				this.makeSource(info, data[i], function(){
					num--;
					if(num == 0){
						cb();
					}
				});
			}
			
			for(var i=0; i<scanAgain.length; i++){
				this.createSources(scanAgain[i], info, num, cb);
			}
		},
		
		makeSource: function(info, data, cb){
			console.log("make source", data.fullPath);
			
			var relPath = data.fullPath.substring(("templates/default/").length);
			
			var path = this.path + this.fs.path.sep + relPath;
			var that = this;
			
			// do not scan libs and not sources
			if(relPath.indexOf("src/js/lib") === 0 || relPath.indexOf("src/") !== 0){
				that.fs.mkdir(that.fs.path.dirname(path), function(){
					that.fs.copy(data.fullPath, path, function(err){
						console.log("skipping", data.fullPath);
						cb();
					});
				});
				return;
			}
			
			
			this.fs.readFile(data.fullPath, function(err, contents){
				var src = contents.toString("utf-8");
				
				for(var i in info.reg){
					if(i == "namespace" && info.isValid){
						src = src.replace(info.reg[i], "\."+info[i]);
						continue;
					}
					src = src.replace(info.reg[i], info[i]);
					
				}
				
				that.fs.mkdir(that.fs.path.dirname(path), function(){
					that.fs.writeFile(path, src, function(err){
						cb();
					});
				});
			});
		},
		
		addCommonFiles: function(infoObj){
			var that = this;
			var info = {};
			for(var i in infoObj){
				if(typeof infoObj[i] !== "object"){
					info[i] = infoObj[i];
				}
			}
			
			//this.fs.copy("templates/common/db.json", this.path + this.fs.path.sep + ".db.json", function(){
				this.openProject(this.id, function(){
					that.fs.after(function(){
						that.saveProjectInfo(info);
						that.send("selectProject", that.id);
					});
				});
			//});
		},
		
		
		getAllProjects: function(path, cb){
			MT.core.FS.readdir(path, false, cb);
		},
		
		makeID: function(num){
			return "p"+(10000+num).toString(36);
		}
		
	}
);