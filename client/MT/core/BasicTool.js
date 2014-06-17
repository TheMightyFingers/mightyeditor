MT(
	MT.core.BasicTool= function(tools){
		this.tools = tools;
		this.project = tools.project;
	},
	{
		initUI: function(ui){
			var that = this;
			this.ui = ui;
			this.button = this.tools.panel.addButton("", "tool."+this.name, function(){
				that.tools.setTool(that);
			});
			
		},
		
		init: function(){
			console.log("init");
		},
   
		select: function(object){
			console.log("select", object);
		},
		
		mouseDown: function(e){
			console.log("mousedown");
		},
   
		mouseUp: function(e){
			console.log("mouseup");
		},
   
		deactivate: function(){
			
		}

	}
);