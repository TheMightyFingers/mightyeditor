MT(
	MT.ui.MainMovie = function(mm){
		this.mm = mm;
		
		this.hideDelete();
	},
	{
		show: function(){
			this.tv = new MT.ui.TreeView([{name: "XXX"}], {root: pp.path});
			this.tv.tree.addClass("ui-keyframes-tree");
			
			this.mm.leftPanel.content.el.appendChild(this.tv.tree.el);
			this.mm.leftPanel.show();
			this.mm.rightPanel.show();
			
			
			this.mm.leftPanel.style.borderRightStyle = "solid";
		},
		
		hide: function(){
			this.tv.tree.hide();
			
		},


	}
);