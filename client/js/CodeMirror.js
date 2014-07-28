Mighty.plugins.SourceEditor.CodeMonkeyPath = "js/plugins/sourceEditor/cm";
(function(){
		var cmPath = Mighty.plugins.SourceEditor.CodeMonkeyPath;
		Mighty.requireFile(cmPath+"/lib/codemirror.js",function(){
			cmPath += "/addon";
			Mighty.requireFile(cmPath+"/fold/foldcode.js");
			Mighty.requireFile(cmPath+"/fold/foldgutter.js");
			Mighty.requireFile(cmPath+"/fold/brace-fold.js");
			Mighty.requireFile(cmPath+"/fold/xml-fold.js");
			Mighty.requireFile(cmPath+"/edit/matchbrackets.js");
			Mighty.requireFile(cmPath+"/search/searchcursor.js");
			Mighty.requireFile(cmPath+"/search/search.js");
			Mighty.requireFile(cmPath+"/dialog/dialog.js");
			
			Mighty.requireFile(cmPath+"/search/match-highlighter.js");
			Mighty.requireFile(cmPath+"/hint/show-hint.js");
			Mighty.requireFile(cmPath+"/hint/javascript-hint.js");
			Mighty.requireFile(cmPath+"/hint/anyword-hint.js");
			Mighty.requireFile(cmPath+"/comment/comment.js");
			Mighty.requireFile(cmPath+"/selection/active-line.js");
			Mighty.requireFile("js/plugins/sourceEditor/jshint.js");
		});
})();

Mighty(
	Mighty.plugins.SourceEditor.CodeMirror = function(sourceEditor){
		this.root = Mighty.plugins.SourceEditor.CodeMonkeyPath;
		this.sourceEditor = sourceEditor;
		this.docs = {};
		this.css = [];
		this.css.push(Tools.ui.addCss(this.root+"/lib/codemirror.css"));
		this.css.push(Tools.ui.addCss(this.root+"/addon/dialog/dialog.css"));
		
		var that = this;
		this.autopopup = true;
		CodeMirror.commands.autocomplete = function(cm) {
			CodeMirror.showHint(cm, CodeMirror.hint.javascript,{
				scopes: [Import, that.sourceEditor.content.plugins.Map.map],
				completeSingle: true
			});
			if(!cm.state.completionActive && !that.autopopup){
				CodeMirror.showHint(cm, CodeMirror.hint.anyword);
			}
			
		};
		
		if(Mighty.plugins.SourceEditor.CodeMirror.listener){
			window.removeEventListener("keydown",Mighty.plugins.SourceEditor.CodeMirror.listener);
		}
		
		Mighty.plugins.SourceEditor.CodeMirror.listener =  function(e){
			if(!that.editor.hasFocus()){
				return;
			}
			
			//autocomplete
			if((e.metaKey || e.ctrlKey) && !e.altKey && (e.which == 32 || e.which == 40) ){
				that.editor.execCommand("autocomplete");
				if(e.preventDefault){
					e.preventDefault();
				}
				return false;
			}
			
			//move up/down
			if(e.altKey && (e.which == 40 || e.which == 38) ){
				var line = that.editor.state.activeLine;
				var c = that.editor.getCursor();
				if(e.ctrlKey){
					var cch = c.ch;
					c.ch = line.text.length;
					
					that.editor.setCursor(c);
					that.editor.replaceSelection("\r\n"+line.text);
					
					if(e.which == 40){
						c.line = c.line+1;
					}
					c.ch = cch;
					that.editor.setSelection(c);
					return;
				}
				
				var inc = -1;
				if(e.which == 40){
					inc = 1;
				}
				
				var cLine = that.editor.getLine(c.line);
				var nLine = that.editor.getLine(c.line+inc);
				
				that.editor.setLine(c.line, nLine);
				that.editor.setLine(c.line+inc, cLine);
				
				c.line = c.line+inc;
				that.editor.setSelection(c);
				that.editor.indentLine(c.line);
				
				if(e.preventDefault){
					e.preventDefault();
				}
				return false;
			}
		};
		
		window.addEventListener("keydown",Mighty.plugins.SourceEditor.CodeMirror.listener);
		
	
		
		this.defaultCfg = {
			indentWithTabs: true,
			lineNumbers: true,
			
			foldGutter: true,
			styleActiveLine: true,
			matchBrackets: true,
			autofocus: true,
			dragDrop: true,
			showTabs: true,
			undoDepth: 500,
			historyEventDelay: 200,
			tabSize: 4,
			cursorBlinkRate: 530
		};
		
		this.loadEditor();
	}
	,{
		loadEditor: function(){
			var that = this;
			this.cfg = Tools.mergeObject(Storage.get("sourceEditor"), this.defaultCfg);
			
			console.log("saved Cfg!!",this.cfg);
			
			var sourceEditor = this.sourceEditor;
			
			var defaultCfg = {
				indentUnit: 4,
				extraKeys: {
					"Ctrl-S": function(cm) {
						sourceEditor.onSave(that.editor.getValue());
					},
					"Ctrl-/": "toggleComment"
				},
				gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-jslint"],
				highlightSelectionMatches: {showToken: /\w/},
				
				onCursorActivity: function() {
					editor.matchHighlight("CodeMirror-matchhighlight");
					delayAutoPopup();
				},
				tabMode: "shift"
			};
			
			
			var cfg = Tools.mergeObject(defaultCfg, this.cfg);
			
			this.updateTabCfg();
			
			this.editor = CodeMirror(this.sourceEditor.editorElement, cfg);
			
			this.setTheme("mighty","dark");
			
			
			var waiting1;
			var waiting2;
			
			var delayAutoPopup = function(){
				clearTimeout(waiting2);
				that.autopopup = false;
				waiting2 = setTimeout(enableAutopopup, 1000);
			};
			
			var updateHints = function(){
				that.updateHints();
				if(!that.editor.state.completionActive && autopopup){
					delayAutoPopup();
				}
			};
			
			var enableAutopopup = function(){
				//autopopup = true;
				if(!that.editor.hasFocus() && !autopopup){
					return;
				}
				that.editor.execCommand("autocomplete");
			};
			this.editor.on("change", function() {
				autopopup = false;
				clearTimeout(waiting1);
				waiting1 = setTimeout(updateHints, 100);
			});
			
		},
		remove: function(){
			this.sourceEditor.editorElement.removeChild(this.sourceEditor.editorElement.firstChild);
		},
	   
		updateOptions: function(options){
			for(var i in options){
				this.editor.setOption(i, options[i]);
				this.cfg[i] = options[i];
			}
			this.updateTabCfg();
		},
		updateTabCfg: function(){
			if(!this.cfg.showTabs){
				$(this.sourceEditor.editorElement).addClass("noTabs");
			}
			else{
				$(this.sourceEditor.editorElement).removeClass("noTabs");
			}
		},
	   
		refresh: function(){
			this.editor.refresh();
		},
		setTheme: function(theme, variant){
			variant = variant || "";
			Tools.ui.addCss(this.root+"/theme/"+theme+".css");
			this.editor.setOption("theme", theme+" "+variant);
		}
		,focus: function(){
			this.editor.focus();
		}
		
		,lastFileToLoad: ""
		,loadSource: function(fileName){
			if(this.docs[fileName]){
				this.editor.swapDoc(this.docs[fileName]);
				this.editor.focus();
				return;
			}
			var that = this;
			var ext = fileName.split(".").pop();
			var mode = this.getModeFromExt(ext);
			
			if(!mode){
				console.warn("unknown file type:", ext);
				return;
			}
			
			Mighty.requireFile("js/plugins/sourceEditor/cm/mode/"+mode+"/"+mode+".js");
			that.docs[fileName] = CodeMirror.Doc(that.sourceEditor.items.map[fileName], mode);
			
			this.lastFileToLoad = fileName;
			
			Mighty.loader.onReady(function(){
				if(that.lastFileToLoad !== fileName && that.lastFileToLoad !== ""){
					return;
				}
				that.editor.mode = mode;
				that.editor.focus();
				that.updateHints();
				that.editor.swapDoc(that.docs[fileName]);
				
				that.docs[fileName].on('change', function(e) {
					var val = that.editor.getValue();
					that.sourceEditor.onSourceChanged(fileName, val);
				});
				
				
				that.editor.matchBrackets();
				
			});
		}
		,knownModes: {
			js: "javascript",
			html: "xml",
			css: "css"
		}
		,getModeFromExt: function(ext){
			return this.knownModes[ext];
		}
		,updateHints: function(){
			var that = this;
			this.editor.operation(function(){
				that.editor.clearGutter("CodeMirror-jslint");
				if(that.editor.mode != "javascript"){
					return;
				}
				var conf = {
					browser: true,
					globalstrict: true,
					loopfunc: true,
					predef: {},
					laxcomma: false
				};
				
				for(var i in Import){
					conf.predef[i] = false;
				}
				
				var globalScope = that.sourceEditor.content.plugins.Map.map;
				if(globalScope){
					for(var i in globalScope){
						conf.predef[i] = false;
					}
				}
				
				JSHINT(that.editor.getValue(),conf);
				
				for (var i = 0; i < JSHINT.errors.length; ++i) {
					var err = JSHINT.errors[i];
					if (!err) continue;
					
					var msg = document.createElement("a");
					msg.errorTxt = err.reason;
					
					msg.addEventListener("click",function(){
						copyToClipboard(this.errorTxt);
					});
					
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
		}
		
	}
);
function copyToClipboard (text) {
  window.prompt ("Copy to clipboard: Ctrl+C, Enter", text);
}
