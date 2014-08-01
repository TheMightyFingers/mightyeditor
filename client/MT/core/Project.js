MT.require("plugins.list");
MT.require("core.keys");
MT.require("ui.Popup");

MT.require("plugins.HelpAndSupport");
MT.require("plugins.FontManager");
MT.require("plugins.MapManager");
MT.require("plugins.SourceEditor");
MT.require("plugins.GamePreview");

MT.DROP = "drop";


MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.core.Project = function(ui, socket){
		MT.core.BasicPlugin.call(this, "Project");
		
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
			"GamePreview"
		];
		
		for(var id=0, i=""; id<this.pluginsEnabled.length; id++){
			i = this.pluginsEnabled[id];
			this.plugins[i.toLowerCase()] = new MT.plugins[i](this);
		}
		
		this.am = this.plugins.assetmanager;
		this.om = this.plugins.objectmanager;
		this.map = this.plugins.mapeditor;
		this.settings = this.plugins.settings;
		
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
		
		a_selectProject: function(id){
			this.id = id;
			window.location.hash = id;
			this.path = "data/projects/"+id;
			
			this.initUI(this.ui);
			this.initPlugins();
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
			
			var iName = new MT.ui.Input(this.ui.events, {key: "title", type: "text"}, prop);
			var iNs = new MT.ui.Input(this.ui.events, {key: "namespace", type: "text"}, prop);
			
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
		
		newProject: function(){
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
			
			var iName = new MT.ui.Input(this.ui.events, {key: "title", type: "text"}, prop);
			var iNs = new MT.ui.Input(this.ui.events, {key: "namespace", type: "text"}, prop);
			
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
			this.ui = ui;
			this.panel = ui.createPanel("Project");
			this.panel.height = 29;
			this.panel.removeHeader();
			this.panel.isDockable = true;
			this.panel.addClass("top");
			
			ui.dockToTop(this.panel);
			
			this.panel.addButton(null, "logo",  function(e){
				console.log("clicked", e);
			});
			
			
			var that = this;
			this.list = new MT.ui.List([
				{
					label: "New",
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