MT.extend("ui.DomElement")(
	MT.ui.Fieldset = function(title){
		MT.ui.DomElement.call(this, "fieldset");
		this.title = title;
	},
	{
		get title(){
			return this.title.innerHTML;
		},
		legend: null,
		set title(val){
			if(!this.legend){
				this.legend = document.createElement("legend");
				this.el.appendChild(this.legend);
			}
			if(val !== void(0) || val != ""){
				this.legend.innerHTML = val;
			}
		}
	}
);