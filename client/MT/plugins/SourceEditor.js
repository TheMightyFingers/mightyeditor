(function(){
	var cmPath = "js/cm";
	MT.requireFile(cmPath+"/lib/codemirror.js",function(){
		
		
		
		cmPath += "/addon";
		MT.requireFile(cmPath+"/fold/foldcode.js");
		MT.requireFile(cmPath+"/fold/foldgutter.js");
		MT.requireFile(cmPath+"/fold/brace-fold.js");
		MT.requireFile(cmPath+"/fold/xml-fold.js");
		MT.requireFile(cmPath+"/edit/matchbrackets.js");
		MT.requireFile(cmPath+"/search/searchcursor.js");
		MT.requireFile(cmPath+"/search/search.js");
		MT.requireFile(cmPath+"/dialog/dialog.js");
		
		
		MT.requireFile(cmPath+"/search/match-highlighter.js");
		MT.requireFile(cmPath+"/hint/show-hint.js");
		MT.requireFile(cmPath+"/hint/javascript-hint.js");
		MT.requireFile(cmPath+"/hint/anyword-hint.js");
		MT.requireFile(cmPath+"/comment/comment.js");
		MT.requireFile(cmPath+"/selection/active-line.js");
		MT.requireFile(cmPath+"/scroll/scrollpastend.js");
		MT.requireFile(cmPath+"/hint/show-hint.js");
		MT.requireFile(cmPath+"/hint/anyword-hint.js");
		//<script src="mode/javascript/javascript.js"></script>
		
		
		
		
		MT.requireFile("js/jshint.js");
		
		var style = document.createElement("link");
		style.setAttribute("rel", "stylesheet");
		style.setAttribute("type", "text/scc");
		style.setAttribute("href", "css/codemirror.css");
		document.head.appendChild(style);
		
		
		style = document.createElement("link");
		style.setAttribute("rel", "stylesheet");
		style.setAttribute("type", "text/scc");
		style.setAttribute("href", "css/cm-tweaks.css");
		document.head.appendChild(style);
		
		style = document.createElement("link");
		style.setAttribute("rel", "stylesheet");
		style.setAttribute("type", "text/scc");
		style.setAttribute("href", cmPath+"/hint/show-hint.css");
		document.head.appendChild(style);
		
	});
})();

MT.extend("core.BasicPlugin")(
	MT.plugins.SourceEditor = function(project){
		MT.core.BasicPlugin.call(this, "source");
		this.project = project;
		this.documents = {};
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.panel = this.ui.createPanel("SourceEditor");
			this.el = this.panel.content;
			
			
		},
		
		installUI: function(){
			this.ui.joinPanels(this.project.plugins.mapeditor.panel, this.panel);
			this.project.plugins.mapeditor.panel.show();
			
			
			this.addPanels();
			this.addTreeView();
			
			this.addEditor();
			
			var that = this;
			var ampv = that.project.plugins.assetmanager.preview;
			var tools = that.project.plugins.tools;
			var zoombox = this.project.plugins.mapmanager.panel;
			var undoredo = this.project.plugins.undoredo;
			
			
			this.buttonPanel = new MT.ui.DomElement();
			this.buttonPanel.addClass("ui-panel-content");
			
			this.buttons = {
				newFile: new MT.ui.Button("N", "ui-button.tool", null, function(){
					console.log("new File");
					that.newFile();
				}),
				
				newFolder: new MT.ui.Button("F", "ui-button.tool", null, function(){
					console.log("new Folder");
					that.newFolder();
				}),
				
				save: new MT.ui.Button("S", "ui-button.tool", null, function(){
					that.save();
				})
			};
			
			for(var i in this.buttons){
				this.buttons[i].show(this.buttonPanel.el);
			}
			
			
			this.panel.on("show", function(){
				tools.panel.content.hide();
				zoombox.hide();
				ampv.hide();
				undoredo.disable();
				MT.events.simulateKey(MT.keys.ESC);
				
				that.addButtons(tools.panel);
			});
			this.panel.on("unselect", function(){
				tools.panel.content.show();
				zoombox.show();
				ampv.show();
				undoredo.enable();
				window.getSelection().removeAllRanges();
				
				that.removeButtons();
			});
			
		},
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
			this.getFiles();
		},
		
		getFiles: function(){
			this.send("getFiles");
		},
		a_receiveFiles: function(files){
			this.tv.merge(files);
		},
		
		save: function(){
			console.log("saving", this.activePanel.data.data, this.editor.getValue());
			this.send("save", this.activePanel.data.data, this.editor.getValue());
		},
		
		newFile: function(){
			var data = this.tv.getData();
			var id = Date.now();
			data.push({
				name: "new File",
				id: id
			});
			
			this.tv.merge(data);
			
			var parsedData = this.tv.getById(id);
			this.tv.enableRename(parsedData);
			this.loadDocument(parsedData.data);
			
			
			
		},
		
		newFolder: function(){
			var data = this.tv.getData();
			var id = Date.now();
			
			data.push({
				name: "new Folder",
				id: id,
				contents: []
			});
			
			this.tv.merge(data);
			
			this.tv.enableRename(this.tv.getById(id));
			
		},
		
		loadDocument: function(data){
			console.log("LOAD:", data);
			var that = this;
			
			var panel = this.documents[data.fullPath];
			if(panel == void(0)){
				panel = new MT.ui.Panel(data.name);
				panel.data = {
					data: data
				};
				
				panel.mainTab.el.setAttribute("title", data.fullPath);
				
				this.documents[data.fullPath] = panel;
				
				panel.on("show", function(){
					that.activePanel = panel;
					if(!panel.data.doc){
						return;
					}
					that.loadDoc(panel);
				});
			}
			
			
			//
			panel.fitIn();
			panel.addClass("borderless");
			
			if(!this.activePanel){
				panel.show(this.rightPanel.content.el);
				this.activePanel = panel;
			}
			else{
				this.activePanel.addJoint(panel);
			}
			
			panel.show();
			
			this.send("getContent", data);
		},
		
		a_fileContent: function(data){
			console.log("received", data);
			var ext = data.name.split(".").pop();
			var mode = this.guessMode(ext);
			
			
			var that = this;
			this.loadMode(mode, function(){
				var doc = that.documents[data.fullPath].data.doc;
				if(!doc){
					doc = CodeMirror.Doc(data.src, mode, 0);
					that.documents[data.fullPath].data.doc = doc;
				}
				
				that.editor.swapDoc(doc);
				that.documents[data.fullPath].show();
				that.loadDoc(that.documents[data.fullPath]);
			});
		},
		
		loadDoc: function(panel){
			
			if(this.editorElement.parentNode){
				this.editorElement.parentNode.removeChild(this.editorElement);
			}
			panel.content.el.appendChild(this.editorElement);
			this.editor.swapDoc(panel.data.doc);
		},
		
		addButtons: function(el){
			this.buttonPanel.show(el.el);
			
		},
		
		removeButtons: function(){
			this.buttonPanel.hide();
		},
		
		addPanels: function(){
			
			this.leftPanel = this.ui.createPanel("file-list-holder");
			this.rightPanel = this.ui.createPanel("source-editor");
			
			this.leftPanel.addClass("borderless");
			this.leftPanel.hide().show(this.el.el);
			
			this.leftPanel.fitIn();
			this.leftPanel.width = 200;
			this.leftPanel.style.setProperty("border-right", "solid 1px #000");
			this.leftPanel.isResizeable = true;
			this.leftPanel.removeHeader();
			
			var that = this;
			this.leftPanel.on("resize", function(w, h){
				that.rightPanel.style.left = w +"px";
			});
			
			
			this.rightPanel.addClass("borderless");
			this.rightPanel.hide().show(this.el.el);
			
			this.rightPanel.fitIn();
			this.rightPanel.style.left = 200+"px";
			this.rightPanel.style.width = "auto";
			this.rightPanel.removeHeader();
			
			this.rightPanel.content.style.overflow = "hidden";
		},
		
		activeTreeItem: null,
		addTreeView: function(){
			
			this.tv = new MT.ui.TreeView([], {
				root: this.project.path
			});
			this.tv.tree.show(this.leftPanel.content.el);
			
			
			var that = this;
			this.tv.on("click", function(data, element){
				console.log("click", data, element);
				
				if(data.contents){
					return;
				}
				
				if(that.activeTreeItem){
					that.activeTreeItem.removeClass("selected");
				}
				that.activeTreeItem = element;
				that.loadDocument(data);
				element.addClass("selected");
			});
			
			this.tv.on("change", function(a, b){
				if(!a || !b){
					return;
				}
				var doc = that.documents[a];
				if(!doc){
					return;
				}
				var name = b.split("/").pop();
				that.documents[b] = doc;
				delete that.documents[a];
				doc.mainTab.el.setAttribute("title", b);
				doc.mainTab.title.innerHTML = name;
				var mode = that.guessMode(name.split(".").pop());
				that.loadMode(mode, function(){
					doc.data.doc.getEditor().setOption("mode", mode);
				});
				
			});
			this.tv.sortable(this.ui.events);
		},
		
		addEditor: function(){
			var defaultCfg = {
				indentUnit: 4,
				extraKeys: {
					"Ctrl-S": function(cm) {
						that.save();
					},
					
					"Ctrl-/": "toggleComment",
					
					"Ctrl-Space": "autocomplete"
				},
				gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-jslint"],
				highlightSelectionMatches: {showToken: /\w/},
				
				onCursorActivity: function() {
					editor.matchHighlight("CodeMirror-matchhighlight");
				},
				
				tabMode: "shift",
				indentWithTabs: true,
				lineNumbers: true,
				
				foldGutter: true,
				styleActiveLine: true,
				matchBrackets: true,
				autofocus: true,
				dragDrop: true,
				showTabs: true,
				undoDepth: 500,
				scrollPastEnd: true,
				historyEventDelay: 200,
				tabSize: 4,
				cursorBlinkRate: 530
			};
			
			this.editorElement = null;
			var that = this;
			
			this.editor = CodeMirror(function(el){
				that.editorElement = el;
			}, defaultCfg);
			
		},
		
		
		guessMode: function(ext){
			var mode = {};
			if(ext == "js"){
				mode.name = "javascript";
				mode.hint = "javascript";
			}
			if(ext == "html"){
				mode.name = "htmlmixed";
				mode.hint = "html";
				mode.scriptTypes = [
						{
							matches: /\/x-handlebars-template|\/x-mustache/i,
							mode: null
						},
						{
							matches: /(text|application)\/(x-)?vb(a|script)/i,
							mode: "vbscript"
						}
				]
			}
			if(ext == "css"){
				mode.name = "css";
				mode.hint = "css";
			}
			return mode;
		},
		_loadedModes: {},
		loadMode: function(mode, cb){
			if(!mode){
				cb();
				return;
			}
			if(!this._loadedModes[mode.name]){
				
				var loadMode = function(){
					if(mode.name == "htmlmixed"){
						MT.requireFile("js/cm/mode/xml/xml.js", function(){
							MT.requireFile("js/cm/mode/" + mode.name + "/" + mode.name + ".js", cb);
						});
					}
					else{
						MT.requireFile("js/cm/mode/" + mode.name + "/" + mode.name + ".js", cb);
					}
				};
				
				
				if(mode.hint){
					MT.requireFile("js/cm/addon/hint/" + mode.hint + "-hint.js", loadMode);
				}
				else{
					loadMode();
				}
			}
			else{
				cb();
			}
		}
		
	}
);