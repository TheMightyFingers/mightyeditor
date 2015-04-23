var defs = [];
(function(){
	var cmPath = "js/cm";
	var addCss = function(src){
		var style = document.createElement("link");
		style.setAttribute("rel", "stylesheet");
		style.setAttribute("type", "text/css");
		style.setAttribute("href", src);
		document.head.appendChild(style);
	};
	
	var defFiles = ["js/tern/defs/ecma5.json", "js/tern/defs/ecma6.json", "js/tern/defs/browser.json"];
	
	for(var i=0; i<defFiles.length; i++){
		(function(i){
			MT.loader.get(defFiles[i], function(src){
				defs[i] = JSON.parse(src);
			});
		})(i);
	}
	
	
	/*MT.requireFile("js/acorn/acorn.js", function(){
		MT.requireFile("js/acorn/acorn_loose.js");
		MT.requireFile("js/acorn/util/walk.js");
		
		MT.requireFile("js/tern/lib/signal.js", function(){
			MT.requireFile("js/tern/lib/tern.js",function(){
				MT.requireFile("js/tern/lib/def.js", function(){
					MT.requireFile("js/tern/lib/comment.js");
					MT.requireFile("js/tern/lib/infer.js", function(){
						MT.requireFile("js/tern/plugin/doc_comment.js");
					});
				});
			});
		});
	});*/
	
	if(window.release){
		MT.requireFile(cmPath+"/lib/codemirror-full.js",function(){
			cmPath += "/addon";
			
			MT.requireFile(cmPath+"/tern/tern.js");
			MT.requireFile(cmPath+"/scroll/scrollpastend.min.js"); 
			//MT.requireFile("js/jshint.min.js");
			
			addCss("css/codemirror.css");
			addCss(cmPath+"/hint/show-hint.css");
			addCss(cmPath+"/fold/foldgutter.css");
			addCss(cmPath+"/dialog/dialog.css");
			addCss("css/cm-tweaks.css");
			addCss(cmPath+"/tern/tern.css");
		});
		return;
	}
	
	MT.requireFile(cmPath+"/lib/codemirror.js", function(){
		cmPath += "/addon";
		MT.requireFile(cmPath+"/comment/comment.js");
		
		MT.requireFile(cmPath+"/dialog/dialog.js");
		
		MT.requireFile(cmPath+"/edit/matchbrackets.js");
		
		MT.requireFile(cmPath+"/fold/brace-fold.js");
		MT.requireFile(cmPath+"/fold/foldgutter.js");
		MT.requireFile(cmPath+"/fold/foldcode.js");
		MT.requireFile(cmPath+"/fold/xml-fold.js");
		
		MT.requireFile(cmPath+"/hint/show-hint.js");
		MT.requireFile(cmPath+"/hint/anyword-hint.js");
		MT.requireFile(cmPath+"/hint/show-hint.js");
		MT.requireFile(cmPath+"/hint/javascript-hint.js");
		MT.requireFile(cmPath+"/hint/xml-hint.js");
		MT.requireFile(cmPath+"/hint/html-hint.js");
		
		MT.requireFile(cmPath+"/scroll/scrollpastend.js"); //!!
		
		MT.requireFile(cmPath+"/search/search.js");
		MT.requireFile(cmPath+"/search/goto-line.js");
		MT.requireFile(cmPath+"/search/searchcursor.js");
		MT.requireFile(cmPath+"/search/match-highlighter.js");
		MT.requireFile(cmPath+"/selection/active-line.js");
		
		
		//MT.requireFile("js/jshint.js");
		MT.requireFile(cmPath+"/tern/tern.js");

		
		addCss("css/codemirror.css");
		addCss(cmPath+"/hint/show-hint.css");
		addCss(cmPath+"/fold/foldgutter.css");
		addCss(cmPath+"/dialog/dialog.css");
		addCss(cmPath+"/tern/tern.css");
		addCss("css/cm-tweaks.css");
		
		
		var WORD = /[\w$]+/, RANGE = 500;
		CodeMirror.registerHelper("hint", "javascript", function(editor, options) {
			var word = options && options.word || WORD;
			var range = options && options.range || RANGE;
			var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
			var start = cur.ch, end = start;
			while (end < curLine.length && word.test(curLine.charAt(end))) ++end;
			while (start && word.test(curLine.charAt(start - 1))) --start;
			var curWord = start != end && curLine.slice(start, end);
			var list = [], seen = {};
			var re = new RegExp(word.source, "g");
			for (var dir = -1; dir <= 1; dir += 2) {
				var line = cur.line, endLine = Math.min(Math.max(line + dir * range, editor.firstLine()), editor.lastLine()) + dir;
				for (; line != endLine; line += dir) {
					var text = editor.getLine(line), m;
					while (m = re.exec(text)) {
						if (line == cur.line && m[0] === curWord) continue;
						if ((!curWord || m[0].lastIndexOf(curWord, 0) == 0) && !Object.prototype.hasOwnProperty.call(seen, m[0])) {
							seen[m[0]] = true;
							list.push(m[0]);
						}
					}
				}
			}
			return {list: list, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end)};
		});
		
	});
})();

MT.FILE_UPLOADED = "FILE_UPLOADED";
MT.FILE_LIST_RECEIVED = "FILE_LIST_RECEIVED";

MT.extend("core.BasicPlugin").extend("core.Emitter")(
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
			var timeline = that.project.plugins.moviemaker.panel;
			var tools = that.project.plugins.tools;
			var zoombox = this.project.plugins.mapmanager.panel;
			var undoredo = this.project.plugins.undoredo;
			
			
			this.buttonPanel = new MT.ui.DomElement();
			this.buttonPanel.addClass("ui-panel-content");
			
			this.buttons = {
				newFile: new MT.ui.Button("", "ui-button.tool.ui-new-file", null, function(){
					that.newFile();
				}),
				
				newFolder: new MT.ui.Button("", "ui-button.tool.ui-new-folder", null, function(){
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
				that.ui.loadLayout(null, 1);
				that.panel.show(that.panel._parent, false);
				
				tools.panel.content.hide();
				zoombox.hide();
				ampv.hide();
				timeline.hide();
				undoredo.disable();
				MT.events.simulateKey(MT.keys.ESC);
				
				that.addButtons(tools.panel);
				
				that.leftPanel.width = parseInt(that.leftPanel.style.width);
				//????
				window.setTimeout(function(){
					that.editor.refresh();
					that.editor.focus();
				},100);
				
				that.editor.refresh();
			});
			this.panel.on("unselect", function(){
				tools.panel.content.show();
				zoombox.show();
				ampv.show();
				timeline.show();
				undoredo.enable();
				window.getSelection().removeAllRanges();
				
				that.removeButtons();
				that.ui.loadLayout(null, 0);
			});
			
			this.project.on(MT.DROP, function(e, data){
				if(!MT.core.Helper.isSource(data.path)){
					return;
				}
				// not dropped file
				if(e){
					var item = that.tv.getOwnItem(e.target);
					if(item && item.data.contents){
						data.path = item.data.fullPath + data.path;
					}
				}
				
				that.uploadFile(data);
			});
			
			this.project.on("updateData", function(data){
				that.panel.el.style.fontSize = data.sourceEditor.fontSize+"px";
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
			this.emit(MT.FILE_LIST_RECEIVED, files);
			this.data = files;
			var fo;
			
			fo = this.getInData("/index.html");
			if(fo){
				this.loadDocument(fo);
			}
			fo = this.getInData("/js/state/play.js");
			if(fo){
				this.loadDocument(fo);
			}
			fo = this.getInData("/js/state/menu.js");
			if(fo){
				this.loadDocument(fo);
			}
			fo = this.getInData("/js/state/load.js");
			if(fo){
				this.loadDocument(fo);
			}
		},
		getInData: function(path, cont){
			cont = cont || this.data;
			for(var i=0; i<cont.length; i++){
				if(cont[i].fullPath == path){
					return cont[i];
				}
				
				if(cont[i].contents){
					var tmp = this.getInData(path, cont[i].contents);
					if(tmp){
						return tmp;
					}
				}
			}
		},
		uploadFile: function(data){
			var tmp = data.src;
			var that = this;
			var nota = this.project.plugins.notification.show(data.path, "Upload in progress...", 999999);
			
			data.src = Array.prototype.slice.call(new Uint8Array(data.src));
			this.send("uploadFile", data, function(){
				that.emit(MT.FILE_UPLOADED, data.path);
				nota.hide();
			});
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
			var that = this;
			
			var panel = this.documents[data.fullPath];
			if(panel == void(0)){
				panel = new MT.ui.Panel(data.name);
				panel.data = {
					data: data,
					needFocus: true,
					opened: 0
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
			if(Date.now() - panel.data.opened < 5*1000){
				return;
			}
			panel.data.opened = Date.now();
			
			
			if(MT.core.Helper.isAudio(data.name)){
				if(panel.audio){
					return;
				}
				var audio = document.createElement("audio");
				var src = document.createElement("source");
				src.setAttribute("src", that.project.path + "/src" + data.fullPath);
				src.setAttribute("type", "audio/"+MT.core.Helper.getExt(data.fullPath));
				audio.appendChild(src);
				audio.setAttribute("controls", "controls");
				panel.content.el.appendChild(audio);
				panel.audio = audio;
				audio.onended = function(){
					audio.load();
				};
			}
			else if(MT.core.Helper.isFont(data.name)){
				this.project.plugins.fontmanager.includeFont(data.fullPath);
				
				this.project.plugins.fontmanager.getFontInfo(data.fullPath, function(infostr){
					var info = {};
					var html = "";
					var char;
					
					if(infostr){
						info = JSON.parse(infostr);
					}
					var fontFamily = info["Family name"];
					var pangrams = "";
					
					for(var j=0; j<5; j++){
							
						var prev = '<div><span style="font-family: \''+fontFamily+'\'; font-size: '+(12+j*j)+'px">';
						for(var i=65; i<91; i++){
							char = String.fromCharCode(i);
							prev+= char.toLowerCase()+char+" ";
						}
						prev += '</span></div>';
						
						pangrams += prev;
					}
					
					pangrams += that.genPangram(fontFamily, 15);
					var table = "<table>";
					for(var k in info){
						table += "<tr><td>"+k+"</td><td>"+info[k]+"</td></tr>";
					}
					table += "</table>";
					
					html = '<div class="font-preview">' + table + pangrams + "</div>";
					panel.content.addClass("font-preview");
					panel.content.el.innerHTML = html;
				});
			}
			else{
				this.send("getContent", data);
			}
			
			return panel;
		},
		
		genPangram: function(fontFamily, size){
			var txt = "Zwölf Boxkämpfer jagen Victor quer über den großen Sylter Deich";
			return '<div><span style="font-family: \''+fontFamily+'\'; font-size: '+size+'px">'+txt+'</span></div>';
			
		},
		
		a_fileContent: function(data){
			var ext = data.name.split(".").pop();
			var mode = this.guessMode(ext);
			
			
			var that = this;
			this.loadMode(mode, function(){
				var doc = that.documents[data.fullPath].data.doc;
				that.documents[data.fullPath].data.src = data.src;
				var edmode = mode._mode || mode;
				if(!doc){
					doc = CodeMirror.Doc(data.src, edmode, 0);
					doc.name = data.fullPath;
					that.documents[data.fullPath].data.doc = doc;
				}
				
				that.editor.swapDoc(doc);
				that.documents[data.fullPath].show();
				that.loadDoc(that.documents[data.fullPath]);
				
			});
		},
		
		loadDoc: function(panel){
			panel.show();
			if(this.editorElement.parentNode){
				this.editorElement.parentNode.removeChild(this.editorElement);
			}
			panel.content.el.appendChild(this.editorElement);
			this.editor.swapDoc(panel.data.doc);
			
			var that = this;
			var si = this.editor.getScrollInfo();
			this.editor.scrollTo(si.left + 1, si.top);
			this.editor.scrollTo(si.left, si.top);
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
		
		moveLine: function(ed, inc){
			var line = ed.state.activeLines[0];
			if(line == void(0)){
				return;
			}
			var c = ed.getCursor();
			
			var cLine = ed.getLine(c.line);
			var nLine = ed.getLine(c.line+inc);
			
			//ed.replaceRange(c.line, nLine);
			ed.replaceRange(nLine, {ch: 0, line: c.line}, {ch: cLine.length, line: c.line});
			c.line = c.line+inc;
			
			
			ed.replaceRange(cLine, {ch: 0, line: c.line}, {ch: nLine.length, line: c.line});
			
			ed.setSelection(c);
			ed.indentLine(c.line);
			
		},
		
		copyLine: function(ed, inc){
			var line = ed.state.activeLines[0];
			if(line == void(0)){
				return;
			}
			var c = ed.getCursor();
			var cch = c.ch;
			c.ch = line.text.length;
			
			ed.setCursor(c);
			ed.replaceSelection("\r\n"+line.text);
			
			c.line = c.line+inc;
			c.ch = cch;
			ed.setSelection(c);
			return;
			
		},
		
		addEditor: function(){
			var that = this;
			var defaultCfg = {
				indentUnit: 4,
				extraKeys: {
					"Ctrl-S": function(cm) {
						that.save();
					},
					"Cmd-S": function(cm) {
						that.save();
					},
					
					"Ctrl-/": "toggleComment",
					"Cmd-/": "toggleComment",
					
					"Ctrl-Space": function(cm){
						that.showHints();
						
						// server.complete(cm);
						
					},
					"Cmd-Space": function(){
						that.showHints();
					},
					
					"Alt-Up": function(ed, e){
						that.moveLine(ed, -1);
					},
					"Alt-Down": function(ed, e){
						that.moveLine(ed, 1);
					},
					"Ctrl-Alt-Up": function(ed){
						that.copyLine(ed, 0);
					},
					"Ctrl-Alt-Down": function(ed){
						that.copyLine(ed, 1);
					},
					"Ctrl-+": function(ed){
						alert();
					},
					"Cmd-Alt-Up": function(ed){
						that.copyLine(ed, 0);
					},
					"Cmd-Alt-Down": function(ed){
						that.copyLine(ed, 1);
					},
					"Cmd-+": function(ed){
						alert();
					},
					"Ctrl-L": "gotoLine",
					"Cmd-L": "gotoLine",
					"Ctrl-Alt-Right": function(cm) { server.jumpToDef(cm); },
					"Ctrl-Alt-Left": function(cm) { server.jumpBack(cm); },
				},
				gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-jslint"],
				highlightSelectionMatches: {showToken: /\w/},
				
				onCursorActivity: function(cm) {
					editor.matchHighlight("CodeMirror-matchhighlight");
					server.updateArgHints(cm);
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
				that.showHints(true);
			});
			this.editor.on("keyup", function(ed, e){
				
				//move up/down
				if(e.altKey && (e.which == MT.keys.UP || e.which == MT.keys.DOWN) ){
					var line = ed.state.activeLines[0];
					var c = ed.getCursor();
					e.preventDefault();
					return false;
				}
			});
			
			window.server = this.server = new CodeMirror.TernServer({
				defs: defs,
				plugins: {doc_comment: {
					fullDocs: true
				}, complete_strings: {
					maxLength: 15
				}},
				switchToDoc: function(name, doc) {
					if(that.documents[doc.name]){
						that.loadDoc(that.documents[doc.name]);
					}
				},

				workerDeps: ["../../../acorn/acorn.js", "../../../acorn/acorn_loose.js",
							"../../../acorn/util/walk.js", "../../../tern/lib/signal.js", "../../../tern/lib/tern.js",
							"../../../tern/lib/def.js", "../../../tern/lib/infer.js", "../../../tern/lib/comment.js",
							"../../../tern/plugin/doc_comment.js"],
				workerScript: "js/cm/addon/tern/worker.js",
				useWorker: true
			});
			
			
			MT.loader.get(this.project.path + "/src/js/lib/phaser.js", function(data){
				server.server.addFile("[phaser]", data);
			});
			MT.loader.get(this.project.path + "/src/js/lib/mt.helper.js", function(data){
				server.server.addFile("[helper]", data);
			});
			
			
			
			/*this.editor.on("keyHandled", function(ed, a,b,c){
				console.log(a,b,c);
				return;
				e.preventDefault();
				e.stopPropagation();
			});*/
		},
		
		showHints: function(autocall){
			if(this.__showHints){
				return;
			}
			
			if(autocall && !this.project.data.sourceEditor.autocomplete){
				return;
			}
			
			//skipSingle = true;
			var that = this;
			var sel = this.editor.doc.sel;
			var range = sel.ranges[0];
			if(!range){
				return;
			}
			var token = this.editor.getTokenAt(range.anchor);
			token.string = token.string.trim();
			if(autocall && token.string != "." && (!token.type || token.string == "" ) ){
				return;
			}
			
			var name = this.editor.doc.name;
			var n = name.substring(name.length -3, name.length)
			
			if(n != ".js"){
				this.__showHints = true;
				this.editor.showHint({completeSingle: !autocall, selectFirst: !autocall});
				window.setTimeout(function(){
					that.__showHints = false;
				}, 0);
				return;
			}
			
			server.getHint(this.editor, function(hints){
				
				if(autocall && token.string != "_"){
					hints.list = hints.list.filter(function(a){
						return (a.text.substring(0, 1) != "_");
					});
				}
				
				var list = hints.list;
				for(var i=0; i<list.length; i++){
					var hint = list[i];
					var data = hint.data;
					if(!data.doc){
						continue;
					}
					if(data.type.indexOf("fn") !== 0){
						continue;
					}
					
					
					data.doc = data.type.substring(2) + "\n\n" + data.doc;
					continue;
				}
				
				that.editor.showHint({hint: function(){return hints;}, completeSingle: !autocall, selectFirst: !autocall});
			});
			
		},
		
		updateHints: function(){
			var that = this;
			
			this.editor.operation(function(){
				that.editor.clearGutter("CodeMirror-jslint");
				if(that.editor.options.mode.name != "javascript"){
					return;
				}
				var conf = {
					browser: true,
					globalstrict: true,
					strict: "implied",
					undef: true,
					unused: true,
					loopfunc: true,
					predef: {
						"Phaser": false,
						"PIXI": false,
						"mt": false,
						"console": false
					},
					laxcomma: false
				};
				
				if(that.lastWorker){
					that.lastWorker.terminate();
				}
				
				var worker = new Worker("js/jshint-worker.js");
				that.lastWorker = worker;
				
				worker.onmessage = function(e) {
					var errors = e.data[0]
					for (var i = 0; i < errors.length; ++i) {
						var err = errors[i];
						if (!err) continue;
						
						var msg = document.createElement("a");
						msg.errorTxt = err.reason;
						var icon = msg.appendChild(document.createElement("span"));
						
						icon.innerHTML = "!";
						icon.className = "lint-error-icon";
						
						var text = msg.appendChild(document.createElement("span"));
						text.className = "lint-error-text";
						text.appendChild(document.createTextNode(err.reason));
						
						msg.className = "lint-error";
						that.editor.setGutterMarker(err.line - 1,"CodeMirror-jslint", msg);
						
						
						
						//var evidence = msg.appendChild(document.createElement("span"));
						//evidence.className = "lint-error-text evidence";
						//evidence.appendChild(document.createTextNode(err.evidence));
					}
				};
				worker.postMessage([that.editor.getValue(), conf ]);
			});
		},
		
		
		delay: 0,
		checkChanges: function(){
			if(!this.activePanel){
				return;
			}
			if(!this.delay){
				var that = this;
				this.delay = window.setTimeout(function(){
					that.updateHints();
					that.delay = 0;
				}, 100);
			}
			
			
			var data = this.activePanel.data;
			if(data.doc && data.src != data.doc.getValue()){
				this.activePanel.mainTab.title.innerHTML = data.data.name + "*";
			}
			else{
				this.activePanel.mainTab.title.innerHTML = data.data.name;
			}
		},
		
		
		checkChangesAndAskSave: function(panel){
			var data = panel.data;
			if(!data.doc){
				return;
			}
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
			var mode = {
				ext: ext
			};
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
				mode._mode = "application/ld+json";
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
