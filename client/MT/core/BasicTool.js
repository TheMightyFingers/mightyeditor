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
			this.tooltip = this.getTooltip();
			
			this.button = this.tools.panel.addButton("", "tool."+this.name, function(){
				that.tools.setTool(that);
			}, this.tooltip);
			
		},
		
		showInfoToolTip: function(no, isError){
			no = no || 0;
			var plugins = this.tools.project.plugins;
			plugins.notification.showToolTips(this, no, isError);
		},
   
		getTooltip: function(name){
			
			var tkey = (this.name || name)+"Tool";
			return tkey;
		},
		// called when tool has been selected
		init: function(){
			console.log("TODO: init");
			this.activate();
		},
		// proxy for init - probably better naming
		activate: function(){
			
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
			this.deinit();
		},
		
		// proxy to deactivate - probably better naming
		deinit: function(){
			
		}

	}
);