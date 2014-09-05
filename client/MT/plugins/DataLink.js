MT.extend("core.BasicPlugin")(
	MT.plugins.DataLink = function(project){
		MT.core.BasicPlugin.call(this, "DataLink");
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
			link += "/"+this.project.path+"/phaser/js/lib/mt.data.js";
			
			
			var b = this.project.panel.addButton(link, "datalink", function(e){
				that.selectElementContents(b.el);
				e.preventDefault();
			});
			
			b.el.onmouseleave = function(){
				window.getSelection().removeAllRanges();
			};
			
			b.style.left = "auto";
			b.style.right = 0;
			b.style.position = "absolute";
		}
		
		
	}
);