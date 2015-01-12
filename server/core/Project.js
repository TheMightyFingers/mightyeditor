MT.require("plugins.AssetManager");
MT.require("plugins.ObjectManager");
MT.require("plugins.Export");
MT.require("plugins.MapEditor");
MT.require("plugins.SourceEditor");
MT.require("plugins.Auth");

MT.require("core.JsonDB");
MT.require("core.FS");

var exec = require('child_process').exec;

MT.extend("core.BasicPlugin")(
	MT.core.Project = function(socket, config, server){
		this.socket = socket;
		this.server = server;
		
		MT.core.BasicPlugin.call(this, this, "Project");
		
		this.auth = new MT.plugins.Auth(this, server);
		
		this.root = config.projectsPath;
		this.fs = MT.core.FS;
		this.dbObject  = null;
		this.dbName = config.dbName;
		
		this.config = config;
		var that = this;
		socket.onClose(function(){
			MT.log("Socket closed", that.id);
			var index = MT.core.Project.allProjects.indexOf(that);
			if(index > -1){
				MT.core.Project.allProjects.splice(index, 1);
			}
			if(that.db){
				that.unload();
				that.db.close();
			}
		});
		
		MT.core.Project.allProjects.push(this);
	},
	{
		a_newProject: function(projectInfo){
			var that = this;
			this.getLastId(function(lastId){
				that.lastId = lastId;
				that.createProject(projectInfo);
			});
		},
		
		a_loadProject: function(id){
			var idr = id.split("-");
			var that = this;
			if(idr.length == 1){
				this.checkAndOpenProject(id);
				return;
			}
			this.loadCommand(idr[0], idr[1]);
		},
		
		checkAndOpenProject: function(id){
			var that = this;
			// is own project?
			var proj = this.auth.getProject(id);
			
			if(!proj){
				// get project access
				var access = this.auth.canUserAccessProject(id, function(yes, allowCopy){
					if(yes){
						that.openProject(id, function(){
							var info = that.getProjectInfo();
							info.id = that.id;
							that.send("selectProject", info);
						});
					}
					else{
						if(that.auth.user){
							that.send("goToHome");
						}
						else{
							var d = {domain: "project", action: "loadProject", arguments:[id]};
							console.log("Request Login", d);
							that.auth.send("login", d);
						}
					}
				});
				return;
			}
			
			console.log("opening own project: FULL ACCESS");
			
			this.openProject(id, function(){
				var info = that.getProjectInfo();
				info.id = that.id;
				that.send("selectProject", info);
			});
			
		},
		
		checkAccess: function(){
			var that = this;
			this.auth.canUserAccessProject(this.id, function(yes, allowCopy){
				if(yes){
					return;
				}
				that.send("goToHome");
			});
		},
		
		a_updateProject: function(info){
			this.updateProject(info);
		},
		
		a_getProjectInfo: function(){
			this.emit("getProjectInfo", this.getProjectInfo());
		},
		
		a_saveProjectInfo: function(info){
			this.saveProjectInfo(info);
		},
		
		loadCommand: function(projectId, command){
			MT.log("loading command", command);
			
			if(command == "copy"){
				this.exec_copy(projectId, projectId.substring(0,1) == this.config.prefix);
				return;
			}
			
			MT.log("unsupported command", command);
		},
		
		exec_copy: function(projectId, local){
			var that = this;
			this.auth.canUserAccessProject(projectId, function(fullAccess, allowCopy){
				if(!allowCopy){
					MT.log("cannto access project", projectId);
					that.send("goToHome");
					return;
				}
				
				that.getLastId(function(id){
					that.send("copyInProgress");
					if(local){
						that.exec_copyR(projectId, that.makeID(id));
					}
					else{
						that.copyAlien(projectId, that.makeID(id));
					}
				});
				
			});
			
			
			
		},
		exec_copyR: function(projectId, newId){
			this.id = newId;
			var that = this;
			this.fs.copy(this.root + "/" + projectId, this.root + "/" + this.id, function(err){
				// copying unknown project?
				if(err){
					MT.log(err, "copying unknown project:", projectId);
				}
				that.openProject(that.id, function(){
					var info = that.getProjectInfo();
					info.id = that.id;
					that.auth.addProject(info, that.id);
					that.send("selectProject", info);
				});
			});
			
		},
		copyAlien: function(projectId, newId){
			var server = this.config.servers[projectId.substring(0,1)];
			
			if(!server){
				MT.debug("cannot find server for the project", projectId);
				return;
			}
			var that = this;
			var tmpName = "./tmp/"+(Math.random()+".zip").substring(2);
			
			exec("wget "+server+"/export/"+projectId+" -O "+tmpName, {cwd: this.dir}, function(err){
				if(err){
					MT.log("Error getting alien project", projectId, err);
				}
				that.id = newId;
				var newProjectPath = that.root + "/" + that.id;
				
				that.fs.mkdir(newProjectPath, function(){
					exec("unzip "+ process.cwd() + "/" + tmpName, {cwd: newProjectPath}, function(err){
						that.openProject(that.id, function(){
							var info = that.getProjectInfo();
							info.id = that.id;
							that.send("selectProject", info);
						});
						that.fs.rm(tmpName);
					});
				});
			});
			//exec("zip -9 -r ../" + that.zipName + " ./", { cwd: that.dir }, cb);
			
		},
		
		saveProjectInfo: function(info){
			this.data.contents[0] = info;
		},
		
		getProjectInfo: function(){
			return this.data.contents[0];
		},
		
		loadData: function(db){
			this.db = db;
			this.data = this.db.get(this.name);
		},
		
		loadPlugins: function(){
			this.unloadPlugins();
			
			this.export = new MT.plugins.Export(this);
			
			this.assets = new MT.plugins.AssetManager(this);
			this.objects = new MT.plugins.ObjectManager(this);
			
			this.map = new MT.plugins.MapEditor(this);
			
			this.sourceeditor = new MT.plugins.SourceEditor(this);
		},
		
		unloadPlugins: function(){
			if(this.export){
				this.export.unload();
				this.assets.unload();
				this.objects.unload();
				this.map.unload();
				this.sourceeditor.unload();
			}
			
		},
		
		openProject: function(pid, cb){
			var that = this;
			console.log("OPEN PROJECT!", pid);
			
			that.path = that.root + MT.core.FS.path.sep + pid;
			this.fs.exists(this.path, function(yes){
				if(!yes){
					MT.log("open project failed", that.path);
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
						MT.log("opening old project", pid);
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
			MT.error("OLD:", this.socket.groups);
			this.loadPlugins();
			this.socket.leaveAllGroups();
			this.socket.joinGroup(this.id);
			
			if(typeof cb == "function"){
				cb();
			}
			
			this.assets.a_sendFiles(this.path);
			this.objects.readData();
			this.map.readData();
			
			MT.error("NEW:", this.socket.groups, MT.core.sockets.length);
		},
		isNewProject: false,
		createProject: function(info){
			
			this.isNewProject = true;
			this.id = this.makeID(this.lastId);
			this.path = this.root + MT.core.FS.path.sep + this.id;
			this.checkNs(info);
			var that = this;
			
			var atLast = function(){
				that.addCommonFiles(info);
				that.auth.addProject(info, that.id);
			};
			
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
					info.id = that.id;
					that.send("selectProject", info);
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
				s = "%" + i + "%";
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
			var relPath = data.fullPath.substring(("templates/default/").length);
			
			var path = this.path + this.fs.path.sep + relPath;
			var that = this;
			
			// do not scan libs and not sources
			if(relPath.indexOf("src/js/lib") === 0 || relPath.indexOf("src/") !== 0){
				that.fs.mkdir(that.fs.path.dirname(path), function(){
					that.fs.copy(data.fullPath, path, function(err){
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
			
			this.openProject(this.id, function(){
				that.fs.after(function(){
					that.saveProjectInfo(info);
					that.a_loadProject(that.id);
				});
			});
		},
		
		
		getLastId: function(cb){
			this.auth.getLastProjectId(cb);
		},
		
		makeID: function(num){
			return this.config.prefix + (100000 + num).toString(36);
		}
		
	}
);
MT.core.Project.allProjects = [];