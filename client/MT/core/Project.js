MT.require("plugins.list");
MT.require("core.keys");
MT.require("ui.Popup");
MT.require("ui.Fieldset");

MT.require("plugins.HelpAndSupport");
MT.require("plugins.FontManager");
MT.require("plugins.MapManager");
MT.require("plugins.SourceEditor");
MT.require("plugins.GamePreview");
MT.require("plugins.Physics");
MT.require("plugins.UserData");
MT.require("plugins.TooltipManager");
MT.require("plugins.Notification");
MT.require("plugins.MovieMaker");
MT.require("plugins.Auth");

MT.DROP = "drop";

 
MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.core.Project = function(ui, socket){
		var that = this;
		MT.core.BasicPlugin.call(this, "Project");
		this.isReady = false;
		this.data = {
			backgroundColor: "#666666",
			webGl: 1,
			sourceEditor:{
				fontSize: 12,
				autocomplete: true
			},
			timeline: {
				skipFrames: 1
			},
			roundPosition: 0
		};
		this.defaultData = JSON.stringify(this.data);
		
		window.pp = this;
		
		this.plugins = {};
		
		this.pluginsEnabled = [
			"Auth",
			"AssetManager",
			"ObjectManager",
			"MapEditor",
			"Tools",
			"Settings",
			"Export",
			//"Import",
			
			"UndoRedo",
			//"DataLink",
			"Analytics",
			"HelpAndSupport",
			"FontManager",
			"MapManager",
			"SourceEditor",
			"GamePreview",
			"Physics",
			"UserData",
			"TooltipManager",
			"Notification",
			"MovieMaker",

		];
		
		for(var id=0, i=""; id<this.pluginsEnabled.length; id++){
			i = this.pluginsEnabled[id];
			this.plugins[i.toLowerCase()] = new MT.plugins[i](this);
		}
		
		this.am = this.plugins.assetmanager;
		this.om = this.plugins.objectmanager;
		this.map = this.plugins.mapeditor;
		
		this.ui = ui;
		
		this.sub = "";
		this.prefix = "p";
		if(window.location.hostname.substring(0, 3) == "us."){
			this.sub = "us";
			this.prefix = "u";
		}
		
		this.initSocket(socket);
		this.ui.events.on("hashchange", function(){
			if(!that.preventReload){
				window.location.reload();
			}
		});
		
		

		
		/*
		 console.log("before unload added");
		window.onbeforeunload = function(e){
			console.log("load", e);
			return "Are you really want to leave MightyEditor?";
		};*/
	},
	{
		preventReload: false,
		a_maintenance: function(data){
			var seconds = data.seconds;
			var content = "System will go down for maintenance in ";
			var desc = "<p>All your current work in progress has been saved.</p><p>Please wait. Editor will reload automatically.</p>";
			
			if(data.type == "new"){
				content = "System is being maintained.";
				desc = "<p>Please wait. Editor will reload automatically.</p>";
				if(data.seconds){
					content += " Be back in ";
				}
			}
			
			if(!data.seconds){
				var pop = new MT.ui.Popup("Maintenance", content + desc);
				return;
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
		
		a_purchaseComplete: function(){
			var pop = new MT.ui.Popup("Payment received",
									"Thank you for supporting MightyEditor!<br />Now you can change project access options.<br />"+
									"If you don't own the current project (e.g. you have created it without being logged in) you have to make a copy of this project.<br /><br />"+
									"Reload MightyEditor to make your subscription effective.");
			pop.showClose();
			pop.addButton("Reload Now", function(){
				window.location.reload();
			});
			pop.addButton("Later", function(){
				pop.hide(true);
			});
		},
		
		a_message: function(msg){
			throw new Error(msg);
		},
		
		a_selectProject: function(info){
			this.id = info.id;
			this.preventReload = true;
			window.location.hash = info.id + "/" + info.rev;
			
			var that = this;
			window.setTimeout(function(){
				that.preventReload = false;
			}, 1000);
			
			this.path = "data/projects/" + info.id + "/" + info.rev;
			
			this.a_getProjectInfo(info);
			
			this.initUI(this.ui);
			this.initPlugins();
			
			this.setUpData();
			
			localStorage.setItem(info.id, JSON.stringify(info));
			
			if(this.copyPopup){
				this.copyPopup.hide();
				this.copyPopup = null;
			}
		},
		
		a_newProject: function(){
			this.newProject();
		},
		
		a_needUpdate: function(){
			var that = this;
			this.showProjectInfo({
				cb: function(prop){
					that.send("updateProject", prop);
				},
				title: "Update project",
				description: "Enter project title",
				button: "Upate"
			});
		},
		
		a_getProjectInfo: function(data){
			MT.core.Helper.updateObject(this.data, data);
			var that = this;
			this.send("getOwnerInfo", null, function(data){
				that.setProjectTimer(data);
			});
		},
		
		a_goToHome: function(){
			window.location = window.location.toString().split("#").shift();
		},
		
		a_copyInProgress: function(){
			var content = "System is being maintained. Will be back in ";
			var desc = "<p>Please wait. Editor will load a project automatically.</p>";
			var pop = new MT.ui.Popup("Copy in progress", desc);
			pop.showClose();
			this.copyPopup = pop;
		},
		
		a_projectHasExpired: function(){
			// reset all
			document.body.innerHTML = "";
			var pop = new MT.ui.Popup("Your project has expired", "");
			this.plugins.auth.buildGoPro(pop.content);
			var t = this;
			pop.addButton("Home", function(){
				t.a_goToHome();
			});
			pop.center();
		},
		// find broken asstes and if images matches object images
		// set Asset name to corresponding object
		// fix due to bug related to the states 
		// reported by guys from: imaginemachine.com
		renameBrokenAssets: function(){
			var atv = pp.plugins.assetmanager.tv;
			atv.items.forEach(function(ii){
				var om = pp.plugins.objectmanager;
				var objs = om.tv.items;
				
				objs.forEach(function(ob){
					if(ii.img && ob.img && ii.img.src == ob.img.src){
						atv.rename(ii, ob.data.name + "." + ii.data.__image.split(".").pop());
						var ob = map.getById(ob.data.id);
						if(ob){
							ob.assetId = ii.data.id;
						}
					}
				});
			});
		},
		
		setUpData: function(){
			document.body.style.backgroundColor = this.data.backgroundColor;
			this.emit("updateData", this.data);
		},
		
		setProjectTimer: function(data){
			if(data.level > 0){
				return;
			}
			var button = this.plugins.auth.mainButton;
			var diff = Date.now() - data.now;
			
			//var 
			button.addClass("expires");
			button.el.title = "Project will expire";
			
			this.updateExpireTime(button, data.created, diff);
		},
		
		updateExpireTime: function(button, created, off){
			
			var second = 1000;
			var minute = 60 * second;
			var hour = 60 * minute;
			var day = 24 * hour;
			
			var expire = (30 * day + (created)) - Date.now() + off;
			if(expire < 0){
				this.a_projectHasExpired();
				return;
			}
			var dd = "", hh = "", mm = "", ss = "";
			
			var days = Math.floor(expire / day);
			if(days){
				dd = days + "";
			}
			
			var hoursR = (expire - days * day)
			
			var hours = Math.floor(hoursR / hour);
			
			hh = hours+"";
			while(hh.length < 2){
				hh = "0"+hh;
			}
			
			var minutesR = (hoursR - hours * hour);
			var minutes = Math.floor(minutesR / minute);
			mm = minutes + "";
			while(mm.length < 2){
				mm = "0"+mm;
			}
			
			
			var secondsR = (minutesR - minutes * minute);
			var seconds = Math.floor(secondsR / second);
			ss = seconds + "";
			while(ss.length < 2){
				ss = "0"+ss;
			}
			
			var ds = dd ? dd + "d" : "";
			button.el.setAttribute("data-expires", ds + " " + hh + ":" + mm + ":" + ss);
			
			var that = this;
			window.setTimeout(function(){
				that.updateExpireTime(button, created, off);
			}, 1000);
		},
		
		copyPopup: null,
		
		reload: function(){
			window.location.reload();
		},
		// user gets here without hash
		_newPop: null,
		newProject: function(){
			if(this._newPop){
				this._newPop.show();
				return;
			}
			if(!this.id){
				// enable Analytics
				this.plugins.analytics.installUI(this.ui);
			}
			
			var that = this;
			var pop = new MT.ui.Popup("Welcome to MightyEditor", "");
			pop.y = (window.innerHeight - 510)*0.45;
			//pop.showClose();
			pop.bg.style.backgroundColor = "rgba(10,10,10,0.3)";
			pop.addClass("starting-popup");
			
			var logo = document.createElement("div");
			logo.className = "logo";
			pop.content.appendChild(logo);
			
			var that = this;
			var newProject = new MT.ui.Button("Create New Project", "new-project", null, function(){
				that.newProjectNext();
				pop.off();
				pop.hide();
			});
			
			var docs = new MT.ui.Button("About MightyEditor","docs", null, function(){
				//http://mightyfingers.com/editor-features/
				var w = window.open("about:blank","_newTab");
				w.opener=null; w.location.href="http://mightyfingers.com/editor-features/";
			});
			
			newProject.show(pop.content);
			docs.show(pop.content)
			
			var recentPanel = this.ui.createPanel("Recent Projects");
			recentPanel.hide();
			recentPanel.fitIn();
			recentPanel.removeBorder();
			
			//recentPanel.show(pop.content);
			
			var projects = document.createElement("div");
			pop.content.appendChild(projects);
			projects.innerHTML = '<span class="label">Recent Projects</span>';
			projects.className = "project-list";
			
			recentPanel.show(projects);
			
			var tmp = null;
			var items = this.getLocalProjects();
			var list = this.makeProjectList(items);
			
			if(items.length == 0 && this.sub != ""){
				list.innerHTML = '<p>If you can\'t see you recent projects - try to click <a href="http://mightyeditor.mightyfingers.com/#no-redirect">here</a></p>';
			}
			
			recentPanel.content.el.appendChild(list);
			
			// enable Auth
			if(!this.id){
				this.plugins.auth.installUI(this.ui);
				this.plugins.auth.show(recentPanel, true);
				pop.on("close", function(){
					that.newProjectNext();
				});
			}
			else{
				this.plugins.auth.show(recentPanel, true);
				pop.showClose();
			}
			
			this._newPop = pop;
		},
		
		getLocalProjects: function(){
			var items = [];
			for(var i=0; i<localStorage.length; i++){
				key = localStorage.key(i);
				if(key.substring(0, this.prefix.length) == this.prefix){
					tmp = JSON.parse(localStorage.getItem(key));
					if(tmp.id){
						items.push(tmp);
					}
					else{
						items.push({
							id: key,
							title: key
						});
					}
				}
			}
			return items;
		},
		
		makeProjectList: function(items, ondelete, onclick){
			var list = document.createElement("div");
			list.className = "list-content";
			
			var p, del;
			for(var i=0; i<items.length; i++){
				p = document.createElement("div");
				p.className = "projectItem";
				if(items[i].id != items[i].title){
					p.innerHTML = items[i].title + " ("+items[i].id+") <span class=\"remove\"></span>";
				}
				else{
					p.innerHTML = items[i].title +" <span class=\"remove\"></span>";
				}
				p.project = items[i].id;
				p.item = items[i];
				
				
				list.appendChild(p);
			}
			
			var removeItem = function(e){
				localStorage.removeItem(e.target.parentNode.project);
				e.target.parentNode.parentNode.removeChild(e.target.parentNode);
			};
			
			list.onclick = function(e){
				if(e.target.className == "remove"){
					if(ondelete){
						ondelete(e.target.parentNode, function(remove){
							if(remove){
								removeItem(e);
							}
						});
					}
					else{
						removeItem(e);
					}
					return;
				}
				if(e.target.project){
					if(onclick){
						onclick(e.target, function(remove){
							if(remove){
								removeItem(e);
							}
						});
					}
					else{
						e.preventDefault();
						window.location.hash = e.target.project;
					}
				}
			};
			return list;
		},
		
		updateProject: function(cb){
			var that = this;
			this.showProjectInfo({
				cb: function(prop){
					that.send("updateProject", prop);
					if(cb){cb(prop);}
				},
				title: "Update project",
				desc: "please review project details and update uproject",
				button: "Update",
				showNamespace: false,
				props: that.data,
				hideNS: true
			});
		},
		
		newProjectNext: function(){
			var that = this;
			this.showProjectInfo({
				cb: function(prop){
					that.send("newProject", prop);
				},
				title: "New Project",
				button: "Create"
			});
		},
		
		showProjectInfo: function(options){
			
			var that = this;
			var pop = new MT.ui.Popup(options.title || "New Project", "");
			pop.removeHeader();
			
			pop.el.style.width = "50%";
			pop.el.style.height= "40%";
			pop.el.style["min-height"] = "200px"
			pop.el.style.top= "20%";
			
			
			var p = new MT.ui.Panel(options.title || "New Project");
			//p.removeHeader()
			
			p.hide().show(pop.content).fitIn();
			p.removeBorder();
			
			var cont = document.createElement("div");
			cont.innerHTML = options.desc || "Enter project title";
			cont.style.margin = "20px 10px";
			p.content.el.appendChild(cont);
			
			if(options.props){
				options.props.title = options.props.title || "New Game";
				options.props.namespace = options.props.namespace || "NewGame";
				options.props.package = options.props.package || "com."+this.getPackageName()+".newgame";
				
				var parts = options.props.package.split(".");
				var val = parts.pop();
				options.props.package = (parts.join(".") + "." + options.props.namespace.replace(/\W/g, '').toLowerCase());
			}
			var prop = options.props || {
				title: "New Game",
				namespace: "NewGame",
				package: "com."+this.getPackageName()+".newgame"
			};
			
			
			
			var iName = new MT.ui.Input(this.ui, {key: "title", type: "text"}, prop);
			var iNs;
			
			if(!options.hideNS){
				var iNs = new MT.ui.Input(this.ui, {key: "namespace", type: "text"}, prop);
			}
			
			var iPac = new MT.ui.Input(this.ui, {key: "package", type: "text"}, prop);
			
			iName.show(p.content.el);
			
			if(!options.hideNS){
				iNs.show(p.content.el);
			}
			
			iPac.show(p.content.el);
			
			
			iName.enableInput();
			iName.on("change", function(n, o){
				var strip = n.replace(/\W/g, '');
				
				if(!options.hideNS){
					iNs.setValue(strip);
				}
				
				var parts = prop.package.split(".");
				var val = parts.pop();
				iPac.setValue(parts.join(".") + "." + n.replace(/\W/g, '').toLowerCase());
			});
			
			
			pop.addButton(options.button || "Create", function(){
				options.cb(prop);
				pop.hide();
			});
		},
		
		loadProject: function(pid){
			this.send("loadProject", pid);
		},
		
		initUI: function(ui){
			var that = this;
			
			this.ui = ui;
			this.panel = ui.createPanel("Project");
			this.panel.height = 29;
			this.panel.removeHeader();
			this.panel.isDockable = true;
			this.panel.addClass("top");
			
			ui.dockToTop(this.panel);
			this.createSettings();
			
			this.panel.addButton(null, "logo",  function(e){
				window.location = window.location.toString().split("#")[0];
				//that.setPop.show();
			});
			
			/* TODO: move to config */
			
			
			this.list = new MT.ui.List([
				{
					label: "Save",
					className: "",
					cb: function(){
						that.send("saveState");
						that.list.hide();
						that.plugins.notification.show("Saved", "...", 1000);
					}
				},
				{
					label: "Save As...",
					className: "",
					cb: function(){
						that.saveAs();
						that.list.hide();
					}
				},
				{
					label: "Clone (eu)",
					className: "",
					cb: function(){
						that.clone();
					}
				},
				{
					label: "Clone (us)",
					className: "",
					cb: function(){
						that.clone(true);
					}
				}
			], ui, true);
			
			var b = this.button = this.panel.addButton("Project", null, function(e){
				e.stopPropagation();
				that.showList();
			});
			
		},
		
		saveAs: function(){
			var pop = new MT.ui.Popup("Save project state", "");
			pop.showClose();
			var that = this;
			
			var d = {name: ""};
			var inp = new MT.ui.Input(this.ui, {key: "name", type: "text", placeholder: "name"}, d, function(){
				
			});
			inp.addClass("full-size");
			inp.show(pop.content);
			inp.enableInput();
			inp.input.setAttribute("placeholder", "name");
			
			pop.addButton("Save", function(){
				that.send("saveState", d.name);
				that.plugins.notification.show("Saved", d.name, 1000);
				pop.hide();
			});
			
			pop.addButton("Cancel", function(){
				pop.hide();
			});
		},
		
		clone: function(us){
			var that = this;
			this.send("allowTmpCopy", null, function(allow){
				if(!allow){
					that.plugins.notification.show("Project copy", "access denied", 1000);
					return;
				}
				
				if(that.sub == "" && !us){
					window.location = window.location.toString()+"-copy";
					return;
				}
				if(that.sub == "us" && us){
					window.location = window.location.toString()+"-copy";
					return;
				}
				
				// alien servers
				// eu -> us
				if(that.sub == "" && us){
					
					var loc = window.location.toString()+"-copy";
					loc = loc.replace("://", "://us.");
					
					window.location = loc;
					return;
				}
				// us -> eu
				if(that.sub == "us" && !us){
					
					var loc = window.location.toString()+"-copy";
					loc = loc.replace("://us.", "://");
					
					window.location = loc;
					return;
				}
			});
		},
		getPackageName: function(){
			var dom = window.location.hostname.split(".").shift();
			var tmpProp = "me"+ dom.substring(0, 2);
			if(this.plugins.auth.userId){
				tmpProp += this.plugins.auth.userId;
			}
			else{
				tmpProp += Math.floor(Math.random()*1000);
			}
			
			return tmpProp;
		},
		createSettings: function(){
			var that = this;
			if(this.data.sourceEditor.autocomplete === void(0)){
				this.data.sourceEditor.autocomplete = 1;
			}
			
			if(!this.data.package){
				this.data.package = ("com."+this.getPackageName()+"." + this.data.namespace.replace(/\W/g, '').toLowerCase());
			}
			
			this.setInputs = {
				label: new MT.ui.Input(this.ui, {key: "title", type: "text"}, this.data),
				package: new MT.ui.Input(this.ui, {key: "package", type: "text"}, this.data),
				bgColor: new MT.ui.Input(this.ui, {key: "backgroundColor", type: "color"}, this.data),
				webGl: new MT.ui.Input(this.ui, {key: "webGl", type: "bool"}, this.data),
				srcEdFontSize: new MT.ui.Input(this.ui, {key: "fontSize", type: "number"}, this.data.sourceEditor),
				autocomplete: new MT.ui.Input(this.ui, {key: "autocomplete", type: "bool"}, this.data.sourceEditor),
													 
				skipFrames: new MT.ui.Input(this.ui, {key: "skipFrames", type: "bool"}, this.data.timeline),
				roundPosition: new MT.ui.Input(this.ui, {key: "roundPosition", type: "bool"}, this.data)
			};
			
			
			this.setInputs.bgColor.on("change", function(val){
				document.body.style.backgroundColor = val;
			});
			
			this.setInputs.srcEdFontSize.on("change", function(val){
				that.setUpData();
			});
			
			
			this.setFields = {
				project: new MT.ui.Fieldset("Project"),
				ui: new MT.ui.Fieldset("UI"),
				sourceEditor: new MT.ui.Fieldset("SourceEditor"),
				timeline: new MT.ui.Fieldset("Timeline"),
				misc: new MT.ui.Fieldset("Misc")
			};
			
			
			
			this.setPanel = new MT.ui.Panel("Properties");
			this.setPanel.removeBorder();
			this.setPanel.fitIn();
			
			MT.ui.addClass(this.setPanel.el, "editor-settings");
			
			this.setPanel.on("show", function(){
				lastData = JSON.stringify(that.data);
			});
			
			this.setButtons = {
				resetLayout: new MT.ui.Button("Reset Layout", "", null, function(){
					that.ui.resetLayout();
				}),
				reset: new MT.ui.Button("Reset", "", null, function(){
					MT.core.Helper.updateObject(that.data, JSON.parse(that.defaultData));
					that.send("saveProjectInfo", that.data);
					that.emit("updateData", that.data);
					that.setUpData();
					
					for(var i in that.setInputs){
						that.setInputs[i].update();
					}
					
				}),
				
				cancel: new MT.ui.Button("Cancel", "", null, function(){
					
					that.data = JSON.parse(lastData);
					that.setInputs.bgColor.setValue(that.data.backgroundColor);
					that.setInputs.srcEdFontSize.setValue(that.data.sourceEditor.fontSize);
					that.setUpData();
				})
			};
			
			this.setInputs.label.show(this.setFields.project.el);
			this.setInputs.package.show(this.setFields.project.el);
			
			this.setInputs.bgColor.show(this.setFields.ui.el);
			this.setInputs.webGl.show(this.setFields.ui.el);
			
			this.setButtons.resetLayout.show(this.setFields.ui.el);
			
			this.setInputs.srcEdFontSize.show(this.setFields.sourceEditor.el);
			this.setInputs.autocomplete.show(this.setFields.sourceEditor.el);
			
			this.setInputs.skipFrames.show(this.setFields.timeline.el);
			this.setInputs.roundPosition.show(this.setFields.misc.el);
			
			
			for(var i in this.setFields){
				this.setPanel.content.el.appendChild(this.setFields[i].el);
				this.setFields[i].addClass("full");
			}
			
			this.setPanel.content.el.appendChild(this.setButtons.reset.el);
			//this.setPanel.content.el.appendChild(this.setButtons.cancel.el);
			
			
			var that = this;
			
			
			var statePanel = new MT.ui.Panel("Saved states");
			statePanel.fitIn();
			this.plugins.auth.on("showProperties", function(panel){
				panel.addJoint(that.setPanel);
				lastData = JSON.stringify(that.data);
				
				panel.addJoint(statePanel);
				that.send("getSavedStates", null, function(states){
					for(var i=0; i<states.length; i++){
						states[i].title = states[i].name;
						states[i].id = states[i].date;
					}
					
					var list = that.makeProjectList(states, function(item, remove){
						console.log("DELETE:", item);
						that.send("removeState", item.item.name);
						remove(true);
					}, function(item, remove){
						console.log("LOAD:", item);
						that.send("loadState", item.item.name, function(){
							window.location.hash = that.id + "/0";
							window.location.reload();
						});
					});
					statePanel.content.el.innerHTML = "";
					statePanel.content.el.appendChild(list);
				});
				
			});
			
			this.plugins.auth.on("hideProperties", function(){
				that.send("saveProjectInfo", that.data);
				that.emit("updateData", that.data);
				that.setUpData();
			});
			
		},
		
		showList: function(){
			this.list.width = 150;
			this.list.y = this.button.el.offsetHeight;
			this.list.x = this.button.el.offsetLeft-5;
			this.list.el.style.bottom = "initial";
			this.list.show(document.body);
		},
		
		initPlugins: function(){
			
			for(var i in this.plugins){
				if(this.plugins[i].initSocket){
					this.plugins[i].initSocket(this.socket);
				}
			}
			
			for(var i in this.plugins){
				this.plugins[i].initUI(this.ui);
			}
			
			for(var i in this.plugins){
				if(this.plugins[i].installUI){
					this.plugins[i].installUI(this.ui);
				}
			}
			
			var that = this;
			var lastTarget = null;
			var className = "ui-dragover";
			
			this.ui.events.on("dragover", function(e){
				if(lastTarget){
					MT.ui.removeClass(lastTarget, className);
				}
				MT.ui.addClass(e.target, className);
				lastTarget = e.target;
			});
			
			var removeClass = function(){
				if(!lastTarget){
					return;
				}
				MT.ui.removeClass(lastTarget, className);
				lastTarget = null;
			};
			
			this.ui.events.on("dragend", removeClass);
			this.ui.events.on("dragleave", removeClass);
			this.ui.events.on(this.ui.events.DROP, function(e){
				that.handleDrop(e);
				removeClass();
			});
			
			this.ui.loadLayout();
			this.ui.isSaveAllowed = true;
			this.isReady = true;
		},
		
		addPlugin: function(name){
			MT.require("plugins."+name);
			var that = this;
			MT.onReady(function(){
				that.initPlugin(name);
			});
		},
		
		initPlugin: function(name){
			var p = new MT.plugins[name](this);
			this.plugins[name.toLowerCase()] = p;
			
			p.initSocket(this.socket);
			p.initUI(this.ui);
			p.installUI(this.ui);
		},
		
		handleDrop: function(e){
			var files = e.dataTransfer.files;
			this.handleFiles(files, e.dataTransfer, e);
		},
		
		handleFiles: function(files, dataTransfer, e){
			for(var i=0; i<files.length; i++){
				//chrome
				if(dataTransfer){
					entry = (dataTransfer.items[i].getAsEntry ? dataTransfer.items[i].getAsEntry() : dataTransfer.items[i].webkitGetAsEntry());
					this.handleEntry(entry, e);
				}
				//ff
				else{
					this.handleFile(files.item(i), e);
				}
			}
		},
		
		handleEntry: function(entry, e){
			var that = this;
			
			if (entry.isFile) {
				entry.file(function(file){
					that.readFile(file, entry.fullPath, e);
				});
			}
			else if (entry.isDirectory) {
				this.send("newFolder", entry.fullPath);
				
				var reader = entry.createReader();
				reader.readEntries(function(ev){
					for(var i=0; i<ev.length; i++){
						that.handleEntry(ev[i], e);
					}
				});
			}
		},
		
		handleFile: function(file){
			
		},
		
		readFile: function(file, path, e){
			var that = this;
			var fr  = new FileReader();
			fr.onload = function(){
				
				that.emit(MT.DROP, e, {
					src: fr.result,
					path: path
				});
			};
			fr.readAsArrayBuffer(file);
		},
		
		isAction: function(name){
			if(name.indexOf("need-login") === 0){
				if(!this.plugins.auth.isLogged){
					var that = this;
					window.setTimeout(function(){
						//
						that.plugins.auth.a_login(function(){
							window.close();
						});
					}, 0);
				}
				else{
					var redirect = name.substring(("need-login-").length);
					if(redirect){
						window.location.href = redirect;
					}
					else{
						window.close();
					}
				}
			}
			
		},
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
			var that = this;
			var pid = window.location.hash.substring(1);
			var load = !(pid == "" || pid == "no-redirect");
			
			this.plugins.auth.initSocket(socket, function(loggedIn){
				if(that.isAction(pid)){
					return;
				}
				else if(load){
					that.loadProject(pid);
				}
			});
			
			if(!load){
				that.newProject();
				this.isReady = true;
			}
			
			this.plugins.auth.installUI(this.ui);
			this.plugins.auth.standAlone = true;
		}
	}
);
