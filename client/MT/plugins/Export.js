MT.extend("core.BasicPlugin")(
	MT.plugins.Export = function(project){
		MT.core.BasicPlugin.call(this, "Export");
		this.project = project;
		
	},
	{
		initUI: function(ui){
			var that = this;
			this.list = new MT.ui.List([
				{
					label: "Phaser.io (.js)",
					className: "",
					cb: function(){
						that.export("phaser");
					}
				},
				{
					label: "Phaser.io (data only)",
					className: "",
					cb: function(){
						that.export("phaserDataOnly");
					}
				}
				/*,
				{
					label: "Tiled (.tml)",
					className: "",
					cb: function(){
						alert("in progress");
					}
				}*/
			
			], ui, true);
			
			var b = ui.topPanel.addButton("Export", null, function(){
				that.showExport();
			});
			b.width = 80;
			
			
			this.list.width = 250;
			this.list.y = b.el.offsetHeight;
			this.list.x = b.el.offsetLeft-5;
			this.list.el.style.bottom = "initial";
			//this.list.removeHeader();
			//this.list.content.overflow = "initial";
			
		},
		
		export: function(dest){
			console.log("export", dest);
			this.send(dest);
		},
		
		showExport: function(){
			var that = this;
			//window.setTimeout(function(){
				that.list.show(document.body);
			//},0);
		},
		
		a_complete: function(data){
			console.log("data",data);
			switch(data.action){
				case "phaser":
					window.location = this.project.path + "/"+ data.file;
					break;
				
				case "phaserDataOnly":
					var w = window.innerWidth*0.5;
					var h = window.innerHeight*0.8;
					var l = (window.innerWidth - w)*0.5;
					var t = (window.innerHeight - h)*0.5;
					
					window.open(this.project.path + "/"+ data.file,"","width="+w+",height="+h+",left="+l+",top="+t+"");
					break;
			}
			
			
		}
		
	}
);