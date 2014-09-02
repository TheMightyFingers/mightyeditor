MT.extend("core.BasicPlugin")(
	MT.plugins.UndoRedo = function(project){
		this.project = project;
		this.buffer = [];
		this._step = 0;
		
		this.max = 100;
		
		this.undos = 0;
		
		window.ur = this;
		this.capacity = 0;
		this.currentOffset = 0;
		
		
		var that = this;
		this.onKeyDown = function(e){
			if(!e.ctrlKey){
				return;
			}
			if(e.which !== "Z".charCodeAt(0)){
				return;
			}
			
			if(!e.shiftKey){
				if(that.step > 0){
					that.step--;
					var data = that.buffer[that.step-1];
					if(data){
						that.om.a_receive(JSON.parse(data), true);
					}
					else{
						that.step++;
					}
				}
				else{
					//console.log("nothing to undo");
				}
				return;
			}
			
			if(that.step < that.buffer.length){
				var data = that.buffer[that.step];
				if(data){
					
					that.om.a_receive(JSON.parse(data), true);
					that.step++;
				}
				else{
					console.log("nothing to redo - no data?");
				}
			}
			else{
				console.log("nothing to redo");
			}
		};
		
		
		this.checkLocalStorageCapacity();
	},
	{
		set step(val){
			this._step = val;
		},
		
		get step(){
			return this._step;
		},
		
		disable: function(){
			this.ui.events.off(this.ui.events.KEYDOWN, this.onKeyDown);
		},
		enable: function(){
			this.ui.events.on(this.ui.events.KEYDOWN, this.onKeyDown);
		},
		
		installUI: function(){
			var that = this;
			
			var stored = localStorage.getItem(that.project.id);
			if(stored){
				this.buffer = JSON.parse(stored);
				this.step = this.buffer.length;
			}
			
			
			this.om = this.project.plugins.objectmanager;
			this.om.on(MT.OBJECTS_SYNC, function(data){
				
				var str = JSON.stringify(data);
				
				if(that.buffer[that.step-1] == str){
					return;
				}
				
				if(that.step > that.max){
					that.buffer.shift();
					that.step--;
				}
				
				that.buffer[that.step] = str;
				that.step++;
				that.save();
			});
			
			this.om.on(MT.OBJECTS_UPDATED, function(data){
				if(that.buffer.length == 0){
					that.buffer.push(JSON.stringify(data));
					that.step++;
				}
			});
			
			
			this.enable();
			
		},
		
		save: function(){
			
			var str = JSON.stringify(this.buffer);
			var off = this.currentOffset;
			
			while(str.length > this.capacity && off < this.step){
				off++;
				str = JSON.stringify(this.buffer.slice(off, this.step));
			}
			this.currentOffset = off;
			
			try{
				localStorage.setItem(this.project.id, str);
			}
			catch(e){
				off++;
				localStorage.setItem(this.project.id, JSON.stringify(this.buffer.slice(this.step - off, this.step)) );
			}
		},
		
		checkLocalStorageCapacity: function(){
			var str = "x";
			var ret = 0;
			var koef = 1;
			
			while(true){
				str += str.substring(0, str.length*koef | 0);
				try{
					localStorage.setItem("test", str);
					ret = str.length;
				}
				catch(e){
					koef -= 0.1;
					if(koef < 0.1){
						break
					}
					
					str = str.substring(0, ret);
				}
			}
			
			
			
			localStorage.removeItem("test");
			
			this.capacity = ret;
		}

	}
);

