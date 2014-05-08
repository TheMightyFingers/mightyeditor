MT.extend("core.BasicPlugin")(
	MT.plugins.DataLink = function(project){
		MT.core.BasicPlugin.call(this, "Export");
		this.project = project;
		
	},
	{ 
		selectElementContents: function(el) {
			var range = document.createRange();
			range.selectNodeContents(el);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		},
		initUI: function(ui){
			var that = this;
			
			var link = window.location.origin;
			link += "/"+this.project.path+"/phaser/mt.data.js";
			
			
			var b = ui.topPanel.addButton(link, "datalink", function(e){
				console.log("DataLink", e);
				that.selectElementContents(b.el);
				e.preventDefault();
			});
			
			b.el.onmouseleave = function(){
				window.getSelection().removeAllRanges();
				console.log("leave");
			};
			
			b.style.left = "auto";
		}
		
		
	}
);