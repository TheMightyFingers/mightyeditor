MT(
	MT.core.BasicTool= function(tools){
		this.tools = tools;
		this.project = tools.project;
	},
	{
		// called once per tool - by default adds tool button on side panel
		initUI: function(ui){
			var that = this;
			this.ui = ui;
			this.button = this.tools.panel.addButton("", "tool."+this.name, function(){
				that.tools.setTool(that);
			});
			
		},
		// called when tool has been selected
		init: function(){
			console.log("TODO: init");
		},
		// called when object has been selected and tool is active
		select: function(object){
			console.log("TODO: select", object);
		},
		// on mouse down
		mouseDown: function(e){
			console.log("TODO: mousedown");
		},
		// on mouse up
		mouseUp: function(e){
			console.log("TODO: mouseup");
		},
		// on mouse move
		mouseMove: function(){
			console.log("TODO: mouse move");
		},
		// called before another tool has been selected
		deactivate: function(){
			console.log("TODO: deactivate");
		}

	}
);