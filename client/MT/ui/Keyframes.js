"use strict";

MT.extend("core.Emitter")(
	MT.ui.Keyframes = function(mm){
		this.panelCollections = {};
		
		var ui = mm.ui;
		var d1 = mm.leftPanel.content;
		var d2 = mm.rightPanel.content;
		
		this.createdFrames = [];
		this.autoAddButtons = [];
		
		this.frameHolderWrapper = document.createElement("div");
		this.frameHolderWrapper.className = "ui-frameHolderWrapper";
		
		
		
		this.mm = mm;
		this.om = this.mm.project.plugins.objectmanager;
		
		var that = this;
		this.data = {};
		
		this.tv = new MT.ui.TreeView([], {root: pp.path});
		this.tv.tree.addClass("ui-keyframes-tree");
		
		this.tv.on("dblclick", function(e, item){
			//that.emit("select",item.data);
			var d = item.data;
			var movie;
			if(d.submovie){
				movie = d.name;
			}
			mm.selectObjectForce(mm.om.getById(d.objectId || d.id));
			mm.keyframes.setActiveMovie(movie);
		});
		
		
		this.scrollTop = 0;
		this.tv.tree.el.onscroll = function(){
			that.scrollTop = that.tv.tree.el.scrollTop;
			that.hideFrames();
			that.showFrames();
			
		};
		
		this.lastSelect = [];
		var select = function(data, el){
			that.lastSelect.push([select, data, el]);
			if(data.isMovie){
				that.unselect();
				that.active = el;
				el.addClass("active");
				return;
			}
			
			if(!data.isMovie || that.activeMovie == data.name){
				that.hideFrames();
				that.emit("select",data);
				that.showFrames();
				return;
			}
			
			
			that.activeMovie = data.name;
			that.markFirstFrame();
			
			that.hideFrames();
			that.showFrames();
			
			that.updateTree(data);
		};
		
		this.tv.on("click", function(data, el){
			select(data, el);
		});
		
		this.tv.on("open", function(el){
			select(el.data, el);
		});
		
		this.tv.on("close", function(el){
			that.hideFrames();
			
			//that.buildData();
			//that.tv.merge(that.data);
			
			that.showFrames();
		});
		
		this.tv.enableInput(ui.events);
		
		this.tv.disableRename();
		
		this.ui = ui;
		
		this.el = document.createElement("div");
		this.el.className = "ui-kf-container";
		
		this.label = document.createElement("div");
		this.label.innerHTML = this.name;
		this.label.className = "ui-kf-label";
		
		this.framesHolders = [];
		
		this.buildFrames();
		this.frames = frames;
		this.frameElements = [];
		
		this.d1 = d1;
		this.d2 = d2;
		
		this.addControls();
		
		this.show();
	},
	{
		activeMovie: "",
		reactivate: function(){
			var sel = this.lastSelect.pop();
			if(sel){
				sel[0](sel[1], sel[2]);
			}
		},
		getMovie: function(){
			if(!this.data || !this.data.movies){
				return null;
			}
			return this.data.movies[this.activeMovie];
		},
		get panels(){
			if(!this.panelCollections[this.data.id]){
				this.panelCollections[this.data.id] = {};
			}
			return this.panelCollections[this.data.id];
		},
		
		setData: function(data){
			this.hide();
			
			this.data = data;
			this.activeMovie = "";
			this.buildData();
			
			this.tv.merge([data]);//.contents);
			this.updateFrames();
		},
		
		buildData: function(){
			var movies = this.data.movies;
			var pp;
			for(var key in movies){
				if(key == this.mm.mainName){
					continue;
				}
				if(this.activeMovie == ""){
					this.activeMovie = key;
				}
				if(pp){
					this.createPanel(key, pp);
				}
				else{
					pp = this.createPanel(key, pp);
				}
			}
			if(this.activeMovie == ""){
				return;
			}
			this.fpsInput.setObject(this.data.movies[this.activeMovie].info);
		},
		
		rebuildData: function(){
			var pp;
			var p;
			for(var key in this.dataIn.movies){
				if(!this.panels[key]){
					p = this.createPanel(key, pp);
					p.show();
				}
				else if(!pp){
					pp = this.panels[key];
				}
			}
			this.show();
			this.panels[this.activeMovie].show();
		},
		
		updateTree: function(data){
			this.data = data;
			this.buildData();
			this.tv.merge(this.data);
			
			this.hideFrames();
			this.showFrames();
		},
		
		update: function(){
			this.hideFrames();
			this.showFrames();
		},
		createPanel: function(name, pp){
			var p = this.panels[name];
			if(p){
				p.hide();
				return p;
			}
			p = new MT.ui.Panel(name);
			p.name = name;
			this.panels[name] = p;
			p.fitIn();
			p.hide();
			if(pp){
				pp.addJoint(p);
			}
			else{
				p.show(this.mm.panel.content.el);
				p.fitIn();
			}
			p.el.style.height = "18px";
			p.el.style.paddingLeft = "70px";
			var that = this;
			p.on("show", function(){
				that.setActiveMovie(p.name, true);
			});
			p.on("rename", function(n, o){
				that.rename(n, o);
			});
			p.isRenamable = true;
			p.removeBorder();
			return p;
		},
		
		rename: function(newName, oldName){
			var item, movie;
			if(newName == "__main"){
				newName += "1";
			}
			
			for(var i in this.mm.items){
				item = this.mm.items[i];
				if(item.movies[newName]){
					continue;
				}
				
				movie = item.movies[oldName];
				delete item.movies[oldName];
				item.movies[newName] = movie;
			}
			
			var p = this.panels[oldName];
			delete this.panels[oldName];
			this.panels[newName] = p;
			p.name = newName;
			
			if(this.activeMovie == oldName){
				this.activeMovie = newName;
			}
			this.updateFrames();
			this.mm.om.sync();
		},
		
		removeConf: function(name){
			var pop = new MT.ui.Popup("Delete movie?", "Are you sure you want to delete movie: " + MT.core.Helper.htmlEntities(name) + "?");
			var that = this;
			pop.addButton("no", function(){
				pop.hide();
			});
			
			pop.addButton("yes", function(){
				that.remove(name);
				pop.hide();
			});
			
			pop.showClose();
		},
		
		remove: function(name){
			var item, movie;
			for(var i in this.mm.items){
				item = this.mm.items[i];
				movie = item.movies[name];
				delete item.movies[name];
			}
			if(this.panels[name]){
				this.panels[name].close();
			}
			
			var k = Object.keys(this.data.movies);
			if(!k.length || (k.length == 1 && k[0] == "__main") ){
				this.mm.clear();
				this.activeMovie = null;
				this.mm.activeMovie = null;
				this.om.sync();
				
				this.mm.setActive(this.mm.data);
				return;
			}
			
			this.activeMovie = k[0];
			this.mm.redrawAll();
			
			this.om.sync();
			return 
		},
		
		isVisible: false,
		hide: function(){
			if(!this.isVisible){
				return;
			}
			this.isVisible = false;
			this.tv.tree.hide();
			this.hideFrames();
			if(this.controlsHolder.parentNode){
				this.controlsHolder.parentNode.removeChild(this.controlsHolder);
			}
			
			for(var key in this.panels){
				this.panels[key].hide();
			}
			this.mm.leftPanel.style.borderRightStyle = "none";
		},
		hideFrames: function(){
			if(this.frameHolderWrapper.parentNode){
				this.frameHolderWrapper.parentNode.removeChild(this.frameHolderWrapper);
			}
			
			for(var i=0; i<this.framesHolders.length; i++){
				this.framesHolders[i].hide();
			}
		},
		show: function(){
			if(this.isVisible){
				return;
			}
			this.isVisible = true;
			this.tv.tree.show(this.d1.el);
			
			if(this.panels[this.activeMovie]){
				this.panels[this.activeMovie].show();
			}
			this.mm.leftPanel.style.borderRightStyle = "solid";
			this.mm.leftPanel.content.el.appendChild(this.controlsHolder);
			this.showFrames();
		},
		
		showFrames: function(){
			this.d2.el.appendChild(this.frameHolderWrapper);
			
			var wrap = this.frameHolderWrapper;
			var it, f, b;
			var t = 7;
			var db = this.d2.bounds;
			var top;
			for(var i=0; i<this.tv.items.length; i++){
				f = this.framesHolders[i];
				if(!f){
					f = this.addFrameHolder();
				}
				var data = this.tv.items[i].data
				it = this.tv.items[i].head;
				if(this.active == this.tv.items[i]){
					f.addClass("active");
				}
				else{
					f.removeClass("active");
				}
				
				if(!it.isVisible){
					return;
				}
				
				b = it.bounds;
				
				if(data.unselectable){
					f.addClass("unselectable");
				}
				
				if(i==0){
					f.addClass("top");
					f.style.height = b.height + 2 +"px";
					top = (b.top - db.top + this.d2.el.scrollTop -1 - wrap.offsetTop);
				}
				else{
					f.removeClass("top");
					f.style.height = b.height + "px";
					 top = (b.top - db.top + this.d2.el.scrollTop +1 - wrap.offsetTop);
				}
				
				f.style.top = top + "px";
				f.el.data = data;
				
				if(b.height > 0){
					wrap.appendChild(f.el);
				}
				else{
					f.hide();
				}
			}
			
			this.tv.tree.el.scrollTop = this.scrollTop;
		},
		active: null,
		setActiveObject: function(id){
			this.unselect();
			var item = this.tv.getById(id);
			if(!item){
				return;
			}
			item.addClass("active");
			this.active = item;
			
		},
		
		unselect: function(){
			if(this.active){
				this.active.removeClass("active");
				this.active = null;
			}
		},
		buildFrames: function(){
			var it = this.tv.items;
			var f;
			for(var i=0; i<it.length; i++){
				f = this.addFrameHolder();
				this.markFrames(it[i], f.el);
			}
			
			this.firstFrame = this.framesHolders[0];
			this.makeControls();
		},
		
		addFrameHolder: function(){
			var f = new MT.ui.DomElement("div");
			f.addClass("ui-kf-frames");
			f.style.position = "absolute";
			this.framesHolders.push(f);
			f.el.innerHTML = "";
			return f;
		},
		
		updateFrames: function(){
			this.lastFrameAccessed = 0;
			this.autoAddInc = 0;
			
			
			var it = this.tv.items;
			var f;
			for(var i=0; i<it.length; i++){
				f = this.framesHolders[i];
				if(!f){
					f = this.addFrameHolder();
				}
				
				while(f.el.firstChild){
					f.el.removeChild(f.el.firstChild);
				}
				this.markFrames(it[i], f.el);
			}
			
			this.firstFrame = this.framesHolders[0];
		},
		
		makeControls: function(){
			
		},
		
		
		markFrames: function(item, track){
			if(!this.activeMovie){
				return;
			}
			
			var mo = item.data;
			if(!mo.movies || !mo.movies[this.activeMovie]){
				this.mm.addMovie(mo, this.activeMovie);
			}
			var movie = mo.movies[this.activeMovie];
			var frames = movie.frames;
			if(!frames){
				this.mm.addMovie(mo, this.activeMovie);
				movie = mo.movies[this.activeMovie];
				frames = movie.frames;
			}
			
			this.addAutoFrame(item.data, movie, track);
			for(var i=0; i<frames.length; i++){
				this.drawFrame(frames, i, track, movie, item.data);
			}
		},
		
		lastFrameAccessed: 0,
		getFrameElement: function(){
			var el = this.createdFrames[this.lastFrameAccessed];
			this.lastFrameAccessed++;
			if(!el){
				el = document.createElement("span");
				this.createdFrames.push(el);
			}
			else{
				if(el.parentNode){
					el.parentNode.removeChild(el);
				}
			}
			return el;
		},
		
		drawFrame: function(frames, index, track, item){
			if(frames[index].keyframe < this.mm.startFrame - 1){
				return;
			}
			
			var el = this.getFrameElement();
			var item = frames[index];
			var startFrame = this.mm.startFrame;
			if(this.mm.selectedFrame == item){
				el.className = "ui-kf-frame active";
			}
			else{
				el.className = "ui-kf-frame";
			}
			track.appendChild(el);
			
			var w = this.mm.frameSize;
			
			el.style.width = w + "px";
			el.style.left = (item.keyframe * w + this.mm.frameOffset) - startFrame * w + "px";

			el.frameInfo = {
				frames: frames,
				index: index
			};
		},
		autoAddInc: 0,
		addAutoFrame: function(item, movie, track){
			if(item.unselectable){
				return;
			}
			var butt = this.autoAddButtons[this.autoAddInc];
			this.autoAddInc++;
			if(!butt){
				butt = new MT.ui.DomElement("span");
				this.autoAddButtons.push(butt);
			}
			else{
				if(butt.el.parentNode){
					butt.el.parentNode.removeChild(butt.el);
				}
			}
			
			butt.addClass("ui-autoFrame ui-button style2");
			butt.el.autoframe = item;
			if(item.autoframe){
				butt.addClass("active");
			}
			track.appendChild(butt.el);
		},
		
		controlsHolder: null,
		stop: null,
		_looptm: 0,
		addControls: function(){
			this.controlsHolder = document.createElement("div");
			this.controlsHolder.className = "ui-keyframes-controls";
			var c = {};
			
			c.play = document.createElement("div");
			c.play.className = "ui-keyframes-play";
			
			c.stop = document.createElement("div");
			c.stop.className = "ui-keyframes-stop";
			
			this.d1.el.appendChild(this.controlsHolder);
			
			c.delete = document.createElement("div");
			c.delete.className = "ui-keyframes-delete";
			
			var fps = {fps: 60};
			this.fpsInput = new MT.ui.Input(this.ui, {key: "fps", min: 1}, fps);
			this.fpsInput.el.className += " keyframes-fps";
			this.controlsHolder.appendChild(this.fpsInput.el);
			var that = this;
			this.fpsInput.on("change", function(val){
				var mov = that.getMovie();
				if(!mov){
					return;
				}
				mov.info.fps = val;
				
				that.mm.redrawAll();
			});
			
			for(var k in c){
				this.controlsHolder.appendChild(c[k]);
			}
			
			var isPlaying = false;
			var currFrame = this.mm.activeFrame;
			var that = this;
			
			
			var playStartFrame = 0;
			
			var next;
			
			var start = Date.now();
			
			
			var settings = this.mm.project.data;
			
			
			var loop = function(reset){
				if(reset){
					start = Date.now();
				}
				if(!isPlaying){
					return;
				}
				if(settings.timeline.skipFrames){
					loopSkipFrames();
					return;
				}
				
				next = that.mm.activeFrame + 1;
				if(next > that.getLastFrame()){
					next = 0;
				}
				
				that.mm.changeFrame(next);
				that.looptm = window.setTimeout(loop, 1000/that.getFps());
			};
			
			var loopSkipFrames = function(reset){
				if(reset){
					start = Date.now();
				}
				if(!isPlaying){
					return;
				}
				
				next = that.mm.activeFrame + 1;
				if(next > that.getLastFrame()){
					next = 0;
				}
				
				that.mm.changeFrame(next);
				var step = 1000/that.getFps();
				var tm = step - (Date.now() - start);
				while(tm < 0){
					tm += step;
					that.mm.activeFrame++;
				}
				start = Date.now();
				that.looptm = window.setTimeout(loop, tm);
			};
			
			var playPause = function(){
				if(!isPlaying){
					c.play.className = "ui-keyframes-pause";
					isPlaying = true;
					playStartFrame = that.mm.activeFrame;
					loop(true);
				}
				else{
					isPlaying = false;
					c.play.className = "ui-keyframes-play";
				}
			};
			
			var stop = this.stop = function(){
				if(!isPlaying){
					playStartFrame = 0;
				}
				isPlaying = false;
				that.mm.changeFrame(playStartFrame);
				c.play.className = "ui-keyframes-play";
			};
			
			
			this.controlsHolder.onmousedown = function(e){
				e.preventDefault();
				e.stopPropagation();
			};
			
			this.controlsHolder.onclick = function(e){
				if(e.target == c.play){
					playPause();
					e.preventDefault();
					e.stopPropagation();
				}
				if(e.target == c.stop){
					stop();
					e.preventDefault();
					e.stopPropagation();
				}
				if(e.target == c.delete){
					that.removeConf(that.activeMovie);
				}
			};
			this.controls = c;
		},
		
		hideDelete: function(){
			console.log("hide DELETE!");
			this.controls.delete.style.display = "none";
		},
		
		getLastFrame: function(){
			
			var movie = this.getMovie();
			if(!movie){
				return 60;
			}
			
			if(movie.info.lastFrame){
				return movie.info.lastFrame;
			}
			
			var max = 0;
			var items = this.mm.items;
			var m, l, mov;
			
			for(var key in items){
				m = items[key].movies;
				if(!m || !m[this.activeMovie]){
					continue;
				}
				mov = m[this.activeMovie].frames;
				if(!mov.length){
					continue;
				}
				l = mov[mov.length - 1];
				if(max < l.keyframe){
					max = l.keyframe;
				}
			}
			
			movie.info.lastFrame = max || 60;
			return max;
		},
		getFps: function(){
			if(this.activeMovie == "" || !this.data || !this.data.movies || !this.data.movies[this.activeMovie]){
				return 60;
			}
			
			
			return this.data.movies[this.activeMovie].info.fps;
		},
		
		markFirstFrame: function(){
			this.mm.changeFrame(0);
			var item, frameData;
			for(var i in this.mm.items){
				item = this.mm.items[i];
				
				if(!item.movies){
					this.mm.addMovie(item, this.activeMovie);
				}
				
				frameData = item.movies[this.activeMovie].frames[0];
				if(frameData){
					if(frameData.keyframe == void(0)){
						frameData.keyframe = 0;
					}
					this.mm.loadState(i, frameData, 0);
				}
				else{
					frameData = this.mm.collect(item);
					frameData.keyframe = 0;
					item.movies[this.activeMovie] = [frameData];
				}
			}
			
			this.updateFrames();
		},
		
		saveActiveFrame: function(ni, all){
			if(!this.activeMovie){
				return;
			}
			var item, frameData;
			var movie;
			var found = false;
			var needSave = false;
			for(var i in this.mm.items){
				item = this.mm.items[i];
				if(this.parent == item){
					//continue;
				}
				if(!all && this.active && this.active.data.id && this.active.data.id != item.id){
					continue;
				}
				if(!item.movies){
					this.mm.addMovie(item, this.activeMovie);
				}
				movie = item.movies[this.activeMovie];
				if(!movie){
					this.mm.clear();
					return;
				}
				found = false;
				for(var j=0; j<movie.frames.length; j++){
					frameData = movie.frames[j];
					if(frameData.keyframe == this.mm.activeFrame){
						movie.frames[j] = this.mm.collect(item, this.mm.activeFrame, movie.frames[j]);
						needSave = true;
						found = true;
						break;
					}
				}
				if(!found && !ni){
					frameData = this.mm.collect(item, this.mm.activeFrame);
					movie.frames.push(frameData);
					needSave = true;
				}
			}
			this.sortFrames();
			this.updateFrames();
			if(needSave){
				this.om.sync();
			}
		},
		
		sortFrames: function(){
			var item, movie;
			for(var i in this.mm.items){
				item = this.mm.items[i];
				for(var m in item.movies){
					movie = item.movies[m];
					movie.frames.sort(function(a,b){
						return a.keyframe - b.keyframe;
					});
				}
			}
		},
		
		removeFrame: function(){
			if(this.mm.activeFrame === 0){
				return;
			}
			var item, frameData;
			var movie;
			var found = false;
			for(var i in this.mm.items){
				item = this.mm.items[i];
				movie = item.movies[this.activeMovie];
				found = false;
				for(var j=0; j<movie.length; j++){
					frameData = movie[j];
					if(frameData.keyframe  == this.mm.activeFrame){
						movie.splice(j, 1);
						break;
					}
				}
			}
			
			
			this.updateFrames();
		},
		changeFrame: function(frame){
			
			var item, frameData;
			var movie, frames;
			var found = false;
			var start = 0;
			var end = 0;
			
			for(var i in this.mm.items){
				item = this.mm.items[i];
				if(!item.movies){
					continue;
				}
				
				movie = item.movies[this.activeMovie];
				if(!movie){
					continue;
				}
				frames = movie.frames;
				found = false;
				start = end = 0; 
				// check keyframe
				for(var j=0; j<frames.length; j++){
					frameData = frames[j];
					if(frameData.keyframe  < frame){
						start = j;
					}
					
					if(frameData.keyframe  == frame){
						found = true;
						this.mm.loadState(i, frameData, frameData.keyframe );
						break;
					}
					
					if(frameData.keyframe  > frame){
						end = j;
						break;
					}
				}
				
				if(found){
					continue;
				}
				
				// only 1 frame has been found
				if(start == end){
					this.mm.loadState(i, frames[start], start);
					continue;
				}
				
				// final frame
				if(start > end){
					this.mm.loadState(i, frames[start], start);
					continue;
				}
				
				// interpolate between frames
				this.mm.interpolate(i, frames[start], frames[end], frame);
				
				
				
			}
		},
		
		markActive: function(data){
			
		},
		
		addEvents: function(){
			
		},
		
		setActiveFrame: function(index){
			if(this.active > -1){
				this.frameElements[this.active].removeClass("active");
			}
			
			this.active = index;
			this.frameElements[this.active].addClass("active");
			
			this.emit("frameChanged", this.active);
		},
		
		setActiveMovie: function(name, fromPanel){
			if(!this.data.movies || !this.data.movies[name]){
				console.log("SHOW?", this.panels);
				return;
			}
			
			this.activeMovie = name;
			this.mm.changeFrame(0);
			this.fpsInput.setObject(this.data.movies[this.activeMovie].info);
			this.updateFrames();
			if(!fromPanel){
				this.panels[name].show();
			}
		},


	}
);