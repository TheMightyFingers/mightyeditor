MT(
	MT.plugins.Settings = function(project){
		
		this.project = project;
		
		
		
	},
	{
		initUI: function(ui){
			this.tv = new MT.ui.TreeView([], ui);
			
			this.panel = ui.addPanel("Settings");
			this.tv.tree.show(this.panel.content.el);
			
			
			
			var that = this;
			var clickFn = function(obj){
				console.log("clicked!", obj);
				that.handleClick(obj);
			};
			
			this.project.am.tv.on("click", function(obj){
				that.handleAssets(obj);
			});
			
			
			
			
			this.project.om.tv.on("click", clickFn);
		},
   
		handleClick: function(obj){
			
			
		},
   
		handleAssets: function(obj){
			var data = [
				{
					name: "Position",
					contents: [
						{
							type: "input",
							name: "x",
							value: 10
						},
						{
							type: "input",
							name: "y",
							value: 10
						},
					
					]
				},
				{
					type: "input",
					name: "zzz",
					value: 7
				}
			];
			
			this.tv.onChange = function(a,b){
				console.log(a,b)
			};
			this.tv.merge(data);
			
		}




	}
);