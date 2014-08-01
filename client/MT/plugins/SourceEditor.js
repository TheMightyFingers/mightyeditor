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
		
		MT.requireFile("js/jshint.js");
		
		
		var addCss = function(src){
			var style = document.createElement("link");
			style.setAttribute("rel", "stylesheet");
			style.setAttribute("type", "text/scc");
			style.setAttribute("href", src);
			document.head.appendChild(style);
		};
		
		
		addCss("css/codemirror.css");
		addCss(cmPath+"/hint/show-hint.css");
		addCss(cmPath+"/fold/foldgutter.css");
		addCss(cmPath+"/dialog/dialog.css");
		
		addCss("css/cm-tweaks.css");
		
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
				newFile: new MT.ui.Button("", "ui-button.tool.ui-new-file", null, function(){
					console.log("new File");
					that.newFile();
				}),
				
				newFolder: new MT.ui.Button("", "ui-button.tool.ui-new-folder", null, function(){
					console.log("new Folder");
					that.newFolder();
				}),
				
				save: new MT.ui.Button("", "ui-button.tool.ui-save-file", null, function(){
					that.save();
				}),
				
				deleteFile: new MT.ui.Button("", "ui-button.tool.ui-delete-file", null, function(){
					that.deleteFile();
				}),
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
			
			this.project.on(MT.DROP, function(e, data){
				if(!MT.core.Helper.isSource(data.path)){
					return;
				}
				console.dir(e.target);
				var item = that.tv.getOwnItem(e.target);
				if(item && item.data.contents){
					data.path = item.data.fullPath + data.path;
				}
				
				that.uploadFile(data);
				
				console.log(item);
				
				console.log("SOURCE dropped File", data);
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
			console.log(files);
			
			this.tv.merge(files);
			var data = this.tv.getData();
		},
		
		uploadFile: function(data){
			this.send("uploadFile", data);
		},
		
		save: function(panel){
			panel = panel || this.activePanel;
			
			if(!panel){
				return;
			}
			var data = panel.data;
			if(data.src == data.doc.getValue()){
				return;
			}
			data.src = data.doc.getValue();
			this.checkChanges();
			
			console.log("saving", panel.data.data, this.editor.getValue());
			this.send("save", {
				path: panel.data.data.fullPath, 
				src: this.editor.getValue()
			});
		},
		restore: function(panel){
			panel = panel || this.activePanel;
			
			if(!panel){
				return;
			}
			var data = panel.data;
			if(data.src == data.doc.getValue()){
				return;
			}
			data.doc.setValue(data.src);
		},
		deleteFile: function(){
			var pop = new MT.ui.Popup("Delete file?", "Are you sure you want to delete file?");
			var that = this;
			pop.addButton("no", function(){
				pop.hide();
			});
			
			pop.addButton("yes", function(){
				that._deleteFile();
				pop.hide();
			});
			pop.showClose();
		},
		
		_deleteFile: function(){
			if(this.activeTreeItem){
				this.send("delete", this.activeTreeItem.data);
				if(!this.activeTreeItem.data.contents && this.activePanel){
					this.activePanel.close();
				}
				return;
				
			}
			if(!this.activePanel){
				return;
			}
			this.send("delete", this.activePanel.data.data);
			this.activePanel.close();
		},
		
		newFile: function(){
			this.send("newFile");
		},
		
		a_newFile: function(id){
			var parsedData = this.tv.getById(id);
			var panel = this.loadDocument(parsedData.data, false);
			panel.data.needFocus = false;
			this.tv.enableRename(parsedData);
		},
		
		newFolder: function(){
			this.send("newFolder");
		},
		
		a_newFolder: function(id){
			var parsedData = this.tv.getById(id);
			this.tv.enableRename(parsedData);
		},
		
		
		rename: function(o, n){
			this.send("rename", {
				o: o,
				n: n
			});
		},
		
		
		
		loadDocument: function(data, needFocus){
			console.log("LOAD:", data);
			var that = this;
			
			var panel = this.documents[data.fullPath];
			if(panel == void(0)){
				panel = new MT.ui.Panel(data.name);
				panel.data = {
					data: data,
					needFocus: true
				};
				
				panel.mainTab.el.setAttribute("title", data.fullPath);
				
				this.documents[data.fullPath] = panel;
				
				panel.on("show", function(){
					var el;
					if(that.activePanel){
						el = that.tv.getById(that.activePanel.data.data.id);
						if(el){
							el.removeClass("selected");
						}
					}
					that.activePanel = panel;
					
					el = that.tv.getById(panel.data.data.id);
					if(el){
						el.addClass("selected");
					}
					if(!panel.data.doc){
						return;
					}
					that.loadDoc(panel, needFocus);
				});
				
				panel.on("close", function(){
					that.checkChangesAndAskSave(panel);
					if(that.activePanel == panel){
						el = that.tv.getById(that.activePanel.data.data.id);
						if(el){
							el.removeClass("selected");
						}
					}
				});
				panel.isCloseable = true;
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
			return panel;
		},
		
		a_fileContent: function(data){
			console.log("received", data);
			var ext = data.name.split(".").pop();
			var mode = this.guessMode(ext);
			
			
			var that = this;
			this.loadMode(mode, function(){
				var doc = that.documents[data.fullPath].data.doc;
				that.documents[data.fullPath].data.src = data.src;
				
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
			
			var that = this;
			window.setTimeout(function(){
				if(panel.data.needFocus !== false){
					that.editor.focus();
				}
			}, 300);
			
			this.updateHints();
			
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
			var select =  function(data, element){
				console.log("click", data, element);
				
				
				
				if(that.activeTreeItem){
					that.activeTreeItem.removeClass("selected");
				}
				that.activeTreeItem = element;
				element.addClass("selected");
				
				if(!data.contents){
					that.loadDocument(data);
				}
			};
			
			this.tv.on("click", select);
			this.tv.on("renameStart", function(){
				if(!that.activePanel){
					return;
				}
				that.activePanel.data.needFocus = false;
			});
			this.tv.on("change", function(a, b){
				if(!a || !b){
					// changed order
					that.saveData();
					return;
				}
				var doc = that.documents[a] || that.documents[b];
				
				if(!doc){
					that.rename(a, b);
					return;
				}
				doc.data.needFocus = true;
				
				var name = b.split("/").pop();
				that.documents[b] = doc;
				delete that.documents[a];
				doc.mainTab.el.setAttribute("title", b);
				doc.mainTab.title.innerHTML = name;
				var mode = that.guessMode(name.split(".").pop());
				that.loadMode(mode, function(){
					var el = that.tv.getById(doc.data.data.id);
					doc.data.needFocus = true;
					
					select(doc.data.data, el);
					
					if(doc.data.doc){
						doc.data.doc.getEditor().setOption("mode", mode);
					}
					
				});
				
				that.rename(a, b);
				
			});
			
			var saveState = function(el){
				that.send("updateFolder", {
					id: el.data.id,
					isClosed: el.data.isClosed
				});
			};
			
			this.tv.on("open", function(el){
				saveState(el);
			});
			
			this.tv.on("close", function(el){
				saveState(el);
			});
			
			this.tv.sortable(this.ui.events);
		},
		
		saveData: function(){
			this.send("update", this.tv.getData());
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
			
			this.editor.on("change", function(){
				that.checkChanges();
			});
			
		},
		
		updateHints: function(){
			var that = this;
			this.editor.operation(function(){
				that.editor.clearGutter("CodeMirror-jslint");
				console.log(that.editor.mode);
				
				if(that.editor.options.mode.name != "javascript"){
					return;
				}
				var conf = {
					browser: true,
					globalstrict: true,
					loopfunc: true,
					predef: {
						"Phaser": false,
						"mt": false,
						"console": false
					},
					laxcomma: false
				};
				
				
				
				/*for(var i in Import){
					conf.predef[i] = false;
				}*/
				
				/*var globalScope = that.sourceEditor.content.plugins.Map.map;
				if(globalScope){
					for(var i in globalScope){
						conf.predef[i] = false;
					}
				}*/
				
				JSHINT(that.editor.getValue(), conf);
				
				for (var i = 0; i < JSHINT.errors.length; ++i) {
					var err = JSHINT.errors[i];
					if (!err) continue;
					
					var msg = document.createElement("a");
					msg.errorTxt = err.reason;
					
					/*msg.addEventListener("click",function(){
						copyToClipboard(this.errorTxt);
					});*/
					
					var icon = msg.appendChild(document.createElement("span"));
					
					icon.innerHTML = "!";
					icon.className = "lint-error-icon";
					
					var text = msg.appendChild(document.createElement("span"));
					text.className = "lint-error-text";
					text.appendChild(document.createTextNode(err.reason));
					
					//var evidence = msg.appendChild(document.createElement("span"));
					//evidence.className = "lint-error-text evidence";
					//evidence.appendChild(document.createTextNode(err.evidence));
					
					msg.className = "lint-error";
					that.editor.setGutterMarker(err.line - 1,"CodeMirror-jslint", msg);
				}
			});
		},
		
		checkChanges: function(){
			if(!this.activePanel){
				return;
			}
			this.updateHints();
			var data = this.activePanel.data;
			if(data.src != data.doc.getValue()){
				this.activePanel.mainTab.title.innerHTML = data.data.name + "*";
			}
			else{
				this.activePanel.mainTab.title.innerHTML = data.data.name;
			}
			
			
		},
		
		
		checkChangesAndAskSave: function(panel){
			var data = panel.data;
			if(data.src === data.doc.getValue()){
				return;
			}
			var that = this;
			var pop = new MT.ui.Popup("File changed", "File has been changed, do you want to save changes?");
			
			pop.addButton("no", function(){
				that.restore(panel);
				pop.hide();
			});
			
			pop.addButton("yes", function(){
				that.save(panel);
				pop.hide();
			});
			pop.showClose();
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
			if(ext == "json"){
				mode.name = "javascript";
			}
			return mode;
		},
		_loadedModes: {},
		loadMode: function(mode, cb){
			if(!mode || !mode.name){
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