MT.require("plugins.AssetManager");
MT.require("plugins.ObjectManager");
MT.require("plugins.Export");
MT.require("plugins.MapEditor");
MT.require("plugins.SourceEditor");
MT.require("plugins.Auth");
MT.require("plugins.FontManager");

MT.require("core.JsonDB");
MT.require("core.FS");

var exec = require('child_process').exec;

MT.extend("core.BasicPlugin")(
	MT.core.Project = function(socket, config, server, postman){
		this.socket = socket;
		this.config = config;
		this.server = server;
		this.postman = postman;
		
		MT.core.BasicPlugin.call(this, this, "Project");
		
		this.auth = new MT.plugins.Auth(this, server);
		
		this.root = config.projectsPath;
		this.fs = MT.core.FS;
		this.dbObject  = null;
		this.dbName = config.dbName;
		
		
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
		
		a_getOwnerInfo: function(data, cb){
			if(!cb){
				return;
			}
			this.auth.getOwnerInfo(this.id, cb);
		},
		
		checkAndOpenProject: function(path){
			var that = this;
			
			var parts = path.split("/");
			var id = parts.shift();
			var rev = parts.shift() || 0;
			this.rev = rev;
			MT.log("OPEN:", rev);
			// is own project?
			var proj = this.auth.getProject(id);
			
			if(!proj){
				// get project access
				var access = this.auth.canUserAccessProject(id, function(yes, allowCopy){
					if(yes){
						that.openProject(id, rev, function(){
							var info = that.getProjectInfo();
							if(!info){
								console.log("NO_INFO:", that.data);
								return;
							}
							info.id = that.id;
							info.rev = rev;
							
							that.send("selectProject", info);
						});
					}
					else{
						if(that.auth.user){
							that.send("goToHome");
						}
						else{
							that.auth.send("login", {domain: "project", action: "loadProject", arguments:[id]});
						}
					}
				});
				return;
			}
			
			this.openProject(id, rev, function(){
				var info = that.getProjectInfo();
				info.id = that.id;
				info.rev = rev;
				
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
		
		a_updateProjectInfo: function(info){
			this.updateProjectInfo(info);
		},
		
		a_getProjectInfo: function(){
			var info =  this.getProjectInfo();
			
			console.log("INFO!", info);
			
			this.emit("getProjectInfo",info);
		},
		
		a_saveProjectInfo: function(info){
			this.saveProjectInfo(info);
		},
		
		loadCommand: function(data, command){
			MT.log("loading command", command);
			var projectId = data.split("/").shift();
			
			if(command == "copy"){
				this.exec_copy(projectId, projectId.substring(0,1) == this.config.prefix);
				return;
			}
			
			MT.log("unsupported command", command);
		},
		
		allowCopy: false,
		a_allowTmpCopy: function(data, cb){
			var that = this;
			if(!cb){
				return;
			}
			this.auth.canUserAccessProject(this.id, function(fullAccess, allowCopy){
				if(fullAccess){
					that.allowCopy = true;
					cb(true);
					setTimeout(function(){
						that.allowCopy = false;
					}, 1000);
				}
				else{
					cb(false);
				}
			});
		},
		
		exec_copy: function(projectId, local){
			var that = this;
			this.auth.canUserAccessProject(projectId, function(fullAccess, allowCopy, allowShare){
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
			this.fs.copy(this.root + "/" + projectId + "/0", this.root + "/" + this.id + "/0", function(err){
				// copying unknown project?
				if(err){
					MT.log(err, "copying unknown project:", projectId);
				}
				that.openProject(that.id, "0", function(){
					var info = that.getProjectInfo();
					info.id = that.id;
					info.rev = "0";
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
						that.openProject(that.id, 0, function(){
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
			var old = this.data.contents[0];
			if(old && old.title != info.title){
				this.auth.updateTitle(info, this.id);
			}
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
			this.fontmanager = new MT.plugins.FontManager(this);
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
		
		a_saveState: function(name, cb){
			
			if(!name){
				name = (new Date()).toISOString().split("T").join(" ").split(".").shift();
			}
			else{
				name = name.replace(/\W+/g, " ");
			}
			var sep = MT.core.FS.path.sep;
			
			var path = this.root + sep + this.id;
			var from = this.path;
			var to = path + sep + name;
			
			this.fs.copy(from, to, cb);
		},
		
		a_loadState: function(name, cb){
			//this.a_saveState();
			name = name.replace(/[^0-9A-z-: ]/g, " ").trim();
			var sep = MT.core.FS.path.sep;
			
			console.log("LOAD STATE:", name);
			
			var path = this.root + sep + this.id;
			var from = path + sep + name;
			var to = path + sep + "0";
			
			this.fs.rm(to);
			this.fs.copy(from, to);
			
			this.db.readData( function(){
				cb && cb();
			});
		},
		
		a_getSavedStates: function(data, cb){
			var sep = MT.core.FS.path.sep;
			var path = this.root + sep + this.id;
			var ret = [];
			this.fs.readdir(path, function(data){
				data.sort(function(a, b){
					return  b.stats.atime.getTime() - a.stats.atime.getTime();
				});
				for(var i=0; i<data.length; i++){
					if(data[i].name == 0){
						continue;
					}
					ret.push({name: data[i].name, date:  data[i].stats.atime.toISOString().split("T").join(" ").split(".").shift()});
				}
				cb && cb(ret);
			});
		},
		
		a_removeState: function(name){
			if(!name){
				return;
			}
			var sep = MT.core.FS.path.sep;
			name = name.split("/").join("__");
			var path = this.root + sep + this.id + sep + name;
			this.fs.rm(path);
		},
		
		openProject: function(pid, rev, cb){
			var that = this;
			var sep = MT.core.FS.path.sep;
			
			var path = that.root + sep + pid;
			rev = rev || "0";
			that.path = path + sep + rev;
			
			this.fs.exists(path, function(yes){
				if(!yes){
					MT.log("open project failed", path);
					that.send("newProject");
					return;
				}
				
				that.id = pid;
				
				var checkDBFile = function(){
					db = that.path + sep + that.dbName;
					that.fs.exists(db, function(yes){
						if(yes){
							new MT.core.JsonDB(db, function(data){
								that.onDbReady(data, cb);
							});
							return;
						}
						
						var rev0 = path + sep + "0";
						that.fs.exists(rev0, function(yes){
							if(yes){
								that.fs.copy(rev0, that.path);
								checkDBFile();
							}
							else{
								that.checkReallyOldProject(db, cb);
							}
						});
					});
				};
				
				var db = path + sep + that.dbName;
				/* fallback for old objects */
				that.fs.exists(db, function(yes){
					if(yes){
						var tmp = that.root + sep + ".." + sep + "tmp" + sep + pid;
						console.log(tmp);
						
						that.fs.mkdir(tmp);
						that.fs.copy(db, that.root + sep + ".." + sep + "tmp" + sep + pid + ".json");
						that.fs.move(path, tmp);
						console.log("MOVING:", path, tmp);
						
						that.fs.mkdir(that.path);
						that.fs.move(tmp, that.path);
					}
					checkDBFile();
				});
				
			});
		},
		
		checkReallyOldProject: function(db, cb){
			MT.log("really relly olf project");
			var that = this;
			that.fs.exists(that.path + "/JsonDB.json", function(yes){
				if(yes){
					that.fs.copy(that.path + "/JsonDB.json", db);
					that.fs.rm(that.path + "/JsonDB.json", function(){
						new MT.core.JsonDB(db, function(data){
							that.onDbReady(data, cb);
						});
					});
					return;
				}
				
				new MT.core.JsonDB(db, function(data){
					that.onDbReady(data, cb);
				});
			});
		},
		
		// here cb tells browser to open project
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
			if(this.socket.groups.length > 0){
				MT.error("OLD:", this.socket.groups);
			}
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
		
		updateProjectInfo: function(){
			this.checkNs(info);
			this.saveProjectInfo(info);
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
			
			var path = this.path + this.fs.path.sep + "0" + this.fs.path.sep + relPath;
			var that = this;
			var sep = this.fs.path.sep;

			// do not scan libs and not sources
			if(relPath.indexOf("src" + sep + "js" + sep + "lib") === 0 || relPath.indexOf("src" + sep) !== 0){
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
						src = src.replace(info.reg[i], "\." + info[i]);
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
			
			this.openProject(this.id, this.rev, function(){
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