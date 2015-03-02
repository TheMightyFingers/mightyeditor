"use strict";

MT.extend("ui.Keyframes")(
	MT.ui.MovieLayer = function(mm){
		MT.ui.Keyframes.call(this, mm);
	},
	{
		setData: function(data){
			this.hide();
			
			this.data = data;
			this.activeMovie = "__main";
			this.buildData();
			this.tv.merge(data.contents);
			this.updateFrames();
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
				return;
			}
		},
		drawFrame: function(frames, index, track, movie, item){
			if(!item.submovie){
				MT.ui.Keyframes.drawFrame.call(this, frames, index, track, movie);
				return;
			}
			
			
			var item = frames[index];
			var startFrame = this.mm.startFrame;
			var w = this.mm.frameSize;
			
			if(frames[index].keyframe < this.mm.startFrame - item.length){
				return;
			}
			
			var el = this.getFrameElement();
			el.style.width = item.length * w + "px";
			el.style.left = (item.keyframe * w + this.mm.frameOffset) - startFrame * w + "px";
			el.frameInfo = {
				frames: frames,
				index: index
			};
			
			
			if(this.mm.selectedFrame == item){
				el.className = "ui-kf-frame active ui-kf-frame-main";
			}
			else{
				el.className = "ui-kf-frame ui-kf-frame-main";
			}
			track.appendChild(el);
		},
		
		changeFrame: function(frame){
			var mo, o;
			
			var sinfo, name, movie, subMovies, sframe, childFrame;
			for(var i=0; i<this.data.contents.length; i++){
				o = this.data.contents[i];
				mo = this.mm.map.getById(o.objectId);
				if(!mo){
					var that = this;
					window.setTimeout(function(){
						that.changeFrame(frame);
					}, 100);
					return;
					continue;
				}
				mo.changeMovieFrame(this.activeMovie, frame, true);
				subMovies = o.contents;
				for(var j=0; j<subMovies.length; j++){
					sinfo = subMovies[j];
					name = sinfo.name;
					movie = sinfo.movies[this.activeMovie];
					if(!movie){
						continue;
					}
					
					var frames = movie.frames;
					if(frames.length === 0){
						continue;
					}
					childFrame = frame;
					for(var f=0; f<frames.length; f++){
						sframe = frames[f];
						if(sframe.keyframe <= frame && sframe.keyframe + sframe.length > frame){
							childFrame = frame - sframe.keyframe;
							mo.changeChildrenMovieFrame(sinfo.name, childFrame);
							break;
						}
					}
				}
			}
		},
		
		saveActiveFrame: function(all){
			if(!this.active){
				return;
			}
			var data = this.active.data;
			
			if(!data.submovie){
				MT.ui.Keyframes.saveActiveFrame.call(this, all);
				return;
			}
			
			var movie = this.active.data.movies[this.activeMovie];
			var frames = movie.frames;
			var frame;
			for(var i=0; i< frames.length; i++){
				frame = frames[i];
				if(frame.keyframe < this.mm.activeFrame && frame.length > this.mm.activeFrame){
					return;
				}
				
			}
			
			if(!data.info){
				data.info = {};
			}
			
			frames.push({keyframe: this.mm.activeFrame, length: data.info.lastFrame});
			
			this.mm.sortFrames(frames);
			this.mm.redrawAll();
			this.mm.om.sync();
		}
	}
);
