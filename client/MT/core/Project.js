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

MT.DROP = "drop";


MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.core.Project = function(ui, socket){
		MT.core.BasicPlugin.call(this, "Project");
		
		this.data = {
			backgroundColor: "#666666",
			sourceEditor:{
				fontSize: 12
			}
		};
		
		window.pp = this;
		
		this.plugins = {};
		
		this.pluginsEnabled = [
			"AssetManager",
			"ObjectManager",
			"MapEditor",
			"Tools",
			"Settings",
			"Export",
			
			"UndoRedo",
			"DataLink",
			"Analytics",
			"HelpAndSupport",
			"FontManager",
			"MapManager",
			"SourceEditor",
			"GamePreview",
			"Physics",
			"UserData"
		];
		
		for(var id=0, i=""; id<this.pluginsEnabled.length; id++){
			i = this.pluginsEnabled[id];
			this.plugins[i.toLowerCase()] = new MT.plugins[i](this);
		}
		
		this.am = this.plugins.assetmanager;
		this.om = this.plugins.objectmanager;
		this.map = this.plugins.mapeditor;
		//this.settings = this.plugins.settings;
		
		this.ui = ui;
		
		//this.initUI(ui);
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
		
		a_selectProject: function(info){
			this.id = info.id;
			window.location.hash = info.id;
			this.path = "data/projects/"+info.id;
			
			this.a_getProjectInfo(info);
			
			this.initUI(this.ui);
			this.initPlugins();
			
			this.setUpData();
			
			localStorage.setItem(info.id, JSON.stringify(info));
			
			
		},
		
		setUpData: function(){
			document.body.style.backgroundColor = this.data.backgroundColor;
			
			this.emit("updateData", this.data);
		},
		
		a_newProject: function(){
			this.newProject();
		},
		
		a_needUpdate: function(){
			var that = this;
			var pop = new MT.ui.Popup("Update Project", "");
			pop.removeHeader();
			
			pop.el.style.width = "50%";
			pop.el.style.height= "40%";
			pop.el.style["min-height"] = "200px"
			pop.el.style.top= "20%";
			
			
			var p = new MT.ui.Panel("Update Project");
			//p.removeHeader()
			
			p.hide().show(pop.content).fitIn();
			p.removeBorder();
			
			var cont = document.createElement("div");
			cont.innerHTML = "Enter project title";
			cont.style.margin = "20px 10px";
			p.content.el.appendChild(cont);
			
			
			
			var prop = {
				title: "New Game",
				namespace: "NewGame"
			};
			
			var iName = new MT.ui.Input(this.ui, {key: "title", type: "text"}, prop);
			var iNs = new MT.ui.Input(this.ui, {key: "namespace", type: "text"}, prop);
			
			iName.show(p.content.el);
			iNs.show(p.content.el);
			
			iName.enableInput();
			
			iName.on("change", function(n, o){
				iNs.setValue(n.replace(/\W/g, ''));
			});
			
			
			pop.addButton("Update", function(){
				that.send("updateProject", prop);
				pop.hide();
			});
			
		},
		
		a_getProjectInfo: function(data){
			for(var i in data){
				this.data[i] = data[i];
			}
		},
		
		// user get here without hash
		newProject: function(){
			var that = this;
			var pop = new MT.ui.Popup("Welcome to MightyEditor", "");
			pop.y = (window.innerHeight - 510)*0.45;
			pop.showClose();
			
			pop.bg.style.backgroundColor = "rgba(10,10,10,0.3)";
			
			pop.addClass("starting-popup");
			var logo = document.createElement("div");
			pop.content.appendChild(logo);
			logo.className = "logo";
			
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
			
			
			var projects = document.createElement("div");
			pop.content.appendChild(projects);
			projects.innerHTML = '<span class="label">Recent Projects</span>';
			projects.className = "project-list";
			
			
			var list = document.createElement("div");
			list.className = "list-content";
			var items = [];
			var tmp = null;
			for(var i=0; i<localStorage.length; i++){
				key = localStorage.key(i);
				if(key.substring(0, 3) !== "ui-" && key != "UndoRedo"){
					tmp = JSON.parse(localStorage.getItem(key));
					if(tmp.id){
						items.push(tmp );
					}
					else{
						items.push({
							id: key,
							title: key
						});
					}
				}
			}
			
			var p;
			for(var i=0; i<items.length; i++){
				p = document.createElement("div");
				p.className = "projectItem"
				p.innerHTML = items[i].title + " ("+items[i].id+")";
				p.project = items[i].id;
				
				list.appendChild(p);
			}
			list.onclick = function(e){
				e.preventDefault();
				if(e.target.project){
					window.location.hash = e.target.project;
					window.location.reload();
				}
				
			};
			
			projects.appendChild(list);
			
			pop.on("close", function(){
				that.newProjectNext();
			});
		},
		
		newProjectNext: function(){
			var that = this;
			var pop = new MT.ui.Popup("New Project", "");
			pop.removeHeader();
			
			pop.el.style.width = "50%";
			pop.el.style.height= "40%";
			pop.el.style["min-height"] = "200px"
			pop.el.style.top= "20%";
			
			
			var p = new MT.ui.Panel("New Project");
			//p.removeHeader()
			
			p.hide().show(pop.content).fitIn();
			p.removeBorder();
			
			var cont = document.createElement("div");
			cont.innerHTML = "Enter project title";
			cont.style.margin = "20px 10px";
			p.content.el.appendChild(cont);
			
			
			
			var prop = {
				title: "New Game",
				namespace: "NewGame"
			};
			
			var iName = new MT.ui.Input(this.ui, {key: "title", type: "text"}, prop);
			var iNs = new MT.ui.Input(this.ui, {key: "namespace", type: "text"}, prop);
			
			iName.show(p.content.el);
			iNs.show(p.content.el);
			
			iName.enableInput();
			
			iName.on("change", function(n, o){
				iNs.setValue(n.replace(/\W/g, ''));
			});
			
			
			pop.addButton("Create", function(){
				that.send("newProject", prop);
				pop.hide();
			});
			//this.send("newProject");
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
				
				that.setPop.show();
			});
			
			
			this.list = new MT.ui.List([
				{
					label: "Home",
					className: "",
					cb: function(){
						window.location = window.location.toString().split("#")[0];
					}
				},
				{
					label: "Clone",
					className: "",
					cb: function(){
						window.location = window.location.toString()+"-copy";
						window.location.reload();
					}
				}
			], ui, true);
			
			var b = this.button = this.panel.addButton("Project", null, function(e){
				e.stopPropagation();
				that.showList();
			});
			
			this.ui.events.on("hashchange", function(){
				console.log("hash changed", "reload?");
				window.location.reload();
			});
			
		},
		
		createSettings: function(){
			var that = this;
			var lastData;
			
			
			this.setPop = new MT.ui.Popup("","");
			this.setPop.removeHeader();
			
			this.setPop.style.height = "50%";
			this.setPop.style.width = "70%";
			this.setPop.y = 200;
			
			
			this.setInputs = {
				bgColor: new MT.ui.Input(this.ui, {key: "backgroundColor", type: "color"}, this.data),
				srcEdFontSize: new MT.ui.Input(this.ui, {key: "fontSize", type: "number"}, this.data.sourceEditor)
				
			};
			
			
			this.setInputs.bgColor.on("change", function(val){
				document.body.style.backgroundColor = val;
			});
			
			this.setInputs.srcEdFontSize.on("change", function(val){
				that.setUpData();
			});
			
			this.setFields = {
				ui: new MT.ui.Fieldset("UI"),
				sourceEditor: new MT.ui.Fieldset("SourceEditor")
			};
			
			
			
			
			this.setPop.on("show", function(){
				console.log("pop show");
				lastData = JSON.stringify(that.data);
			});
			
			this.setPanel = new MT.ui.Panel("Editor Properties");
			this.setPanel.removeBorder();
			
			this.setPanel.hide().show(this.setPop.content).fitIn();
			
			this.setPop.hide();
			
			
			this.setPop.addButton("Save", function(){
				that.setPop.hide();
				that.send("saveProjectInfo", that.data);
				that.emit("updateData", that.data);
			});
			this.setPop.addButton("Cancel", function(){
				that.setPop.hide();
				that.data = JSON.parse(lastData);
				
				that.setInputs.bgColor.setValue(that.data.backgroundColor);
				that.setInputs.srcEdFontSize.setValue(that.data.sourceEditor.fontSize);
				that.setUpData();
			});
			
			this.setButtons = {
				resetLayout: new MT.ui.Button("Reset Layout", "", null, function(){
					that.ui.resetLayout();
				})
			};
			
			
			this.setInputs.bgColor.show(this.setFields.ui.el);
			this.setButtons.resetLayout.show(this.setFields.ui.el);
			
			this.setInputs.srcEdFontSize.show(this.setFields.sourceEditor.el);
			
			
			
			for(var i in this.setFields){
				this.setPanel.content.el.appendChild(this.setFields[i].el);
				this.setFields[i].addClass("full");
			}
			
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
			} else if (entry.isDirectory) {
				this.send("newFolder", entry.fullPath);
				
				var reader = entry.createReader();
				reader.readEntries(function(ev){
					for(var i=0; i<ev.length; i++){
						that.handleEntry(ev[i]);
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
			fr.readAsBinaryString(file);
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