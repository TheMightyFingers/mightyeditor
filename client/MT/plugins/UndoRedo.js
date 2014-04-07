MT.extend("core.BasicPlugin")(
	MT.plugins.UndoRedo = function(project){
		this.project = project;
		this.buffer = [];
		this._step = 0;
		
		this.max = 100;
		
		this.undos = 0;
		
		window.ur = this;
		
	},
	{
		set step(val){
			this._step = val;
			console.log(val);
		},
		
		get step(){
			return this._step;
		},
		
		installUI: function(){
			var that = this;
			
			this.om = this.project.plugins.objectsmanager;
			this.om.on("beforeSync", function(data){
				
				var str = JSON.stringify(data);
				
				if(that.buffer[that.step-1] == str){
					console.log("nothing changed");
					return;
				}
				
				if(that.step > that.max){
					that.buffer.shift();
				}
				else{
					that.buffer[that.step] = str;
					that.step++;
				}
				
				
				
				
				
			});
			this.om.on("afterSync", function(data){
				if(that.buffer.length == 0){
					that.buffer.push(JSON.stringify(data));
					that.step++;
				}
			});
			
			
			this.ui.events.on("keydown", function(e){
				if(e.which == "Z".charCodeAt(0)){
					if(!e.shiftKey){
							
							if(that.step > 0){
								that.step--;
								var data = that.buffer[that.step];
								that.om.a_receive(JSON.parse(data), true);
							}
							else{
								console.log("nothing to undo");
							}
					}
					else{
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
					}
				}
			});
			
		}

	}
);

