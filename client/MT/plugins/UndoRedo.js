MT.extend("core.BasicPlugin")(
	MT.plugins.UndoRedo = function(project){
		this.project = project;
		this.buffer = [];
		this.step = 0;
		
		window.ur = this;
		
	},
	{
		installUI: function(){
			var that = this;
			
			this.om = this.project.plugins.objectsmanager;
			this.om.on("beforeSync", function(data){
				if(that.step < that.buffer.length){
					that.buffer.splice(that.step, that.buffer.length-that.step);
				}
				that.step++;
				that.buffer.push(JSON.stringify(data));
				
				if(that.buffer.length > 100){
					that.buffer.shift();
				}
			});
			this.om.on("afterSync", function(data){
				if(that.step == 0){
					that.step++;
					that.buffer.push(JSON.stringify(data));
				}
			});
			
			
			this.ui.events.on("keydown", function(e){
				if(e.which == "Z".charCodeAt(0)){
					if(!e.shiftKey){
						if(that.step > 0){
							that.step--;
							var data = that.buffer[that.step];
							that.om.a_receive(JSON.parse(data));
							//that.om.sync(true);
						}
					}
					else{
						if(that.step < that.buffer.length){
							
							var data = that.buffer[that.step];
							that.om.a_receive(JSON.parse(data));
							that.step++;
							//that.om.sync(true);
						}
						
					}
				}
			});
		}

	}
);

