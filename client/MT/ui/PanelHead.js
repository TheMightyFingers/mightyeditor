MT.extend("ui.DomElement")(
	MT.ui.PanelHead = function(panel){
		MT.ui.DomElement.call(this);
		this.addClass("ui-panel-header");
		this.panel = panel;
		this.el.panel = panel;
		this.tabs = [];
	},
	{
		addTab: function(title, cb){
			var tab = new MT.ui.DomElement("span");
			
			tab.addClass("panel-head-tab");
			
			tab.title = document.createElement("span");
			tab.title.innerHTML = title;
			tab.el.setAttribute("title", title);
			tab.el.appendChild(tab.title);
			
			tab.panel = tab.el.panel = this.panel;
			
			var that = this;
			tab.el.data = {
				panel: this.panel
			};
			if(this.tabs.length == 0){
				tab.addClass("active");
			}
			
			this.tabs.push(tab);
			this.appendChild(tab);
			return tab;
		},
		
		allowRename: function(){
			
			
		},
		
		removeTab: function(tab){
			for(var i=0; i<this.tabs.length; i++){
				if(this.tabs[i] == tab){
					this.tabs.splice(i, 1);
					return;
				}
			}
			
		},
		
		setTabs: function(tabs){
			for(var i=0; i<this.tabs.length; i++){
				this.tabs[i].remove();
			}
			
			this.tabs = tabs;
			
			var width = (100/this.tabs.length);
			this.showTabs();
			
		},
		
		showTabs: function(){
			if(!this.tabs.length){
				console.error("TABELEES");
			}
			
			
			var width = (100/this.tabs.length);
			
			for(var i=0; i<this.tabs.length; i++){
				this.appendChild(this.tabs[i]);
				this.tabs[i].style.width = width+"%";
				if(this.tabs[i].panel == this.panel){
					this.setActiveTab(this.tabs[i]);
				}
			}
			
		},
		
		
		updateTabs: function(){
			for(var i=0; i<this.tabs.length; i++){
				this.tabs[i].remove();
				this.appendChild(this.tabs[i]);
			}
		},
		
		
		setActiveTab: function(tab){
			tab = tab || this.panel.mainTab;
			var t = null;
			for(var i=0; i<this.tabs.length; i++){
				t = this.tabs[i];
				if(t == tab){
					t.addClass("active");
					continue;
				}
				t.removeClass("active");
			}
		},
		
		setActiveIndex: function(index){
			var t = null;
			for(var i=0; i<this.tabs.length; i++){
				t = this.tabs[i];
				if(i == index){
					t.addClass("active");
					continue;
				}
				t.removeClass("active");
			}
		}




	}
);