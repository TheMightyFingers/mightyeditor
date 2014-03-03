MT.require("ui.Button");
MT(
	MT.ui.Panel = function(){
		this.el = document.createElement("div");
		this.el.className = "panel";
		this.el.style.top = 0;
		this.el.style.left = 0;
		this.el.style.right = 0;
		this.el.style.position = "absolute";
		this.append();
	},
	{
		append: function(parent){
			this.parent = parent || document.body;
			this.parent.appendChild(this.el);
		},
		resize: function(w,h){
			this.el.style.width = w;
			this.el.style.height = h;
		}
		
		
		
		
		
		
	}
);

