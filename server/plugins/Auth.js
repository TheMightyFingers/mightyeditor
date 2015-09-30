"use strict";
/*
 * To maintain backwards compability and awoid big refactor
 * project.id == auth.link
 */
MT.requireFile(process.cwd() + "/../client/MT/misc/validation.js");
MT.require("core.Session");
MT.extend(MT.core.BasicPlugin)(
	MT.plugins.Auth = function(project){
		MT.core.BasicPlugin.call(this, project, "Auth");
		
		this.session = new MT.core.Session(this);
		
		this.server = project.server;
		
		this.config = MT.plugins.Auth.config;
		this.request = MT.plugins.Auth.request;
		this.serverConfig = MT.plugins.Auth.serverConfig;
		
		this.db = MT.plugins.Auth.db;
		this.postman = MT.plugins.Auth.postman;
		this.sessionId = "";
		this.sessionStarted = 0;
		
		// set default user.. and make him subscriber;
		this.user = {
			id: 1,
			email: "test@example.com",
			level: 1,
			password: "test123"
		};
	},
	{
		get md5(){
			return "848a8b83c4084ad604f25293c118781b";
		},
		
		randomMD5: function(){
			return this.md5;
		},
		a_test: function(data, cb){
			cb(data);
		},
		
		a_logout: function(){
			
		},
		
		a_register: function(d, cb){
			cb && cb();
		},
		
		a_checkSession: function(sessionId){
			this.proceed(sessionId);
		},
		
		a_deleteProject: function(id){
			this.deleteProject(id);
		},
		
		a_getShareOptions: function(data, cb){
			var that = this;
			this.getProjects(function(projects){
				that.getShareOptions(data, cb);
			});
		},
		
		a_getSocialConfig: function(data, cb){
			if(!cb){
				MT.log("get socialConfig: nocb");
				return;
			}
			cb({}); 
		},
		
		getOwnerInfo: function(){
			return this.user;
		},
		getShareOptions: function(projects, cb){
			var proj = this.getProject(this.project.id);
			if(!proj){
				console.log("cannot find project", this.projects, this.project.id);
				cb();
				return;
			}
			
			var that = this;
			this.getProjectEmails(function(err, row){
				if(err){
					MT.log("Failed to get email list for project", that.project.id);
				}
				var emails = [];
				for(var i=0; i<row.length; i++){
					emails.push(row[i].email);
				}
				if(!proj.access){
					proj.access = 0;
				}
				var binstr = proj.access.toString(2);
				if(binstr.length < 2){
					binstr = "0" + binstr;
				}
				that.project.shareOptions = {
					emails: emails,
					allowCopy: parseInt(binstr[1]),
					shareWithLink: parseInt(binstr[0]),
					shareLink: proj.secret,
					userId: that.user.id
				};
				cb(that.project.shareOptions);
			});
		},
		
		a_saveProjectShareOptions: function(options){
			if(!this.session.isValid(this.session.id)){
				console.log("badSession");
				return;
			}
			var that = this;
			var project = this.getProject(this.project.id);
			
			this.db.run("DELETE FROM projects_emails WHERE project_id = ?", project.id, function(){
				for(var i=0; i<options.emails.length; i++){
					that.db.run("INSERT INTO projects_emails (project_id, email) VALUES (?, ?)", project.id, options.emails[i]);
				}
				
				var access = options.shareWithLink+""+options.allowCopy;
				that.db.run("UPDATE projects SET access = ? WHERE id = ?", parseInt(access, 2), project.id, function(){
					var projects = MT.core.Project.allProjects;
					projects.forEach(function(project){
						if(project == that.project){
							return;
						}
						if(project.id == that.project.id){
							project.checkAccess();
						}
					});
				});
			});
		},
		
		getProject: function(link){
			return;
		},
		
		canUserAccessProject: function(link, cb){
			cb(true, true);
		},
		
		getProjectAccess: function(access){
			return {
				allowCopy: 1,
				allowShare: 1
			};
		},
		
		getProjectEmails: function(cb){
			var project = this.getProject(this.project.id);
			this.db.all("SELECT email FROM projects_emails WHERE project_id = ?", project.id, cb);
		},
		//
		proceed: function(session_id){
			if(session_id){
				this.session.update(session_id);
			}
			else{
				this.session.create();
			}
			this.session.save();
			
			var that = this;
			this.send("sessionId", this.session.id);
			this.getProjects(function(data){
				that.send("loggedIn", {projects: data, level: that.user.level, userId: that.user.id});
			});
		},
		
		getProjects: function(cb){
			var ret = [];
			if(!this.user){
				cb(ret);
				return null;
			}
			var that = this;
			this.db.all("SELECT * FROM projects WHERE user_id = ?",this.user.id, function(err, all){
				if(err){
					MT.debug(err);
					cb(ret);
					return;
				}
				
				that.projects = all;
				for(var i=0; i<all.length; i++){
					ret.push({
						id: all[i].link,
						title: all[i].title
					});
				}
				cb(ret);
			});
		},
		
		addProject: function(info, link){
			var user = this.user || {
				id: 0
			};
			this.db.run("INSERT INTO projects (user_id, title, created, link, secret) VALUES (?, ?, ?, ?, ?)", [user.id, info.title, Date.now(), link, this.md5]);
		},
		
		updateTitle: function(info, link){
			if(!link){
				return;
			}
			this.db.run("UPDATE projects SET title = ? WHERE link = ?", [info.title, link]);
		},
		
		updateProjectLink: function(id, link){
			this.db.run("UPDATE projects SET link = ? WHERE id = ?", [link, id]);
		},
		
		updateProject: function(info){
			
		},
		
		getLastProjectId: function(cb){
			this.db.get("SELECT MAX(id) as lastID FROM projects", function(err, row){
				if(err){
					MT.log("last insert:",err);
					cb(0);
					return;
				}
				// first record?
				if(!row){
					cb(0);
					return;
				}
				cb(row.lastID);
			})
		},
		
		deleteProject: function(info){
			this.db.run("DELETE FROM projects WHERE link = ? AND user_id = ?", info.project, this.user.id);
		},
		
		//static methods;
		init: function(server, config){
			
			var self = MT.plugins.Auth;
			if(this instanceof self){
				MT.log("this method supposed to be called statically");
				return;
			}
			
			self.serverConfig = config;
			self.config = config.auth;
			self.request = require('request');
			self.postman = global.postman;
			
			// init db
			this.initDB();
		},
		
		initDB: function(){
			
			var self = MT.plugins.Auth;
			if(this instanceof self){
				MT.log("this method supposed to be called statically");
				return;
			}
			
			var sqlite = require('sqlite3').verbose();
			this.db = new sqlite.Database(process.cwd() + "/secret/projects.db");
			
			this.db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='projects';", function(err, row){
				if(row == void(0)){
					MT.log("creating DB");
					self.createDB();
				}
			});
		},
		
		createDB: function(){
			var self = MT.plugins.Auth;
			if(this instanceof self){
				MT.log("this method supposed to be called statically");
				return;
			}
			
			var db = this.db;
			db.serialize(function() {
				db.run("CREATE TABLE projects (id INTEGER PRIMARY KEY ASC, user_id INTEGER, title TEXT, link TEXT, secret TEXT, created INTEGER, access INTEGER DEFAULT 0)");
				db.run("CREATE INDEX user_id ON projects (user_id)");
				
				db.run("CREATE UNIQUE INDEX link ON projects (link)");
				db.run("CREATE INDEX secret ON projects (secret)");
				
				db.run("CREATE TABLE projects_emails (project_id TEXT, email TEXT)");
				db.run("CREATE UNIQUE INDEX project_email ON projects_emails (project_id, email)");
			});
		},
		collectFreeProjects: function(){
			var self = MT.plugins.Auth;
			var db = self.db;
			MT.core.FS.readdir(self.serverConfig.projectsPath, false, function(data){
				for(var i=0; i<data.length; i++){
					var info = MT.core.FS.readFile(data[i].fullPath + MT.core.FS.path.sep + self.serverConfig.dbName, self.scanCB(data[i]) );
				}
			});
		},
		
		scanCB: function(data){
			var self = MT.plugins.Auth;
			return function(e, str){
				if(e){
					return;
				}
				
				var json = JSON.parse(str);
				
				var info;
				for(var i=0; i<json.contents.length; i++){
					if(json.contents[i].name == "Project"){
						info = json.contents[i].contents[0];
						if(!info){
							MT.log("Scanning projects - Bad project", data);
							return;
						}
						info.id = data.name;
						break;
					}
				}
				if(!info){
					return;
				}
				self.importProject(info);
			};
		},
		
		importProject: function(info){
			var self = MT.plugins.Auth;
			var db = self.db;
			db.run("INSERT INTO projects (user_id, title, created, link) VALUES (0, ?, ?, ?)", [info.title, Date.now(), info.id], function(e){
				if(e){
					console.log("import failed", e, info);
				}
			});
		}
	}
);
