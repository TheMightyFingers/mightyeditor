/*
 * deprecated - rewritten to ui.Controller
 */
"use strict";
MT.require("ui.Holder");
MT.require("ui.Panel");
MT.require("ui.Events");

MT(
	MT.ui.UIController = function(){
		window.ui = this;
		
		this.events = new MT.ui.Events();
		
		
		
		this.addHolders();
		this.addCenter();
		this.addEvents();
		
		
		this.topPanel= this.addPanel("top-buttons", this.top);
		
		this.topPanel.removeHeader();
		this.topPanel.addClass("top");
		
		var logo = this.topPanel.addButton(null, "logo",  function(e){
			
		});
		logo.width = 70;
		logo.height = 27;
		
		
		var that = this;
		this.events.on("resize", function(){
			that.resize();
		});
		
	},
	{
		_onResize: [],
		onResize: function(cb){
			this._onResize.push(cb);
		},
		resize: function(){
			this.alignCenter();
			this.right.setPosition();
		},
		addHolders: function(){
			
			this.top = new MT.ui.Holder(MT.ui.position.TOP, this.events);
			this.top.height = 29;
			this.top.el.className += " top";
			
			this.top.resizeable = false;
			this.top.show(document.body);
			
			
			this.left = new MT.ui.Holder(MT.ui.position.LEFT, this.events);
			this.left.width = 40;
			this.left.resizeable = false;
			this.left.addTop(this.top);
			this.left.el.className += " left";
			this.left.show(document.body);
			
			
			this.bottom = new MT.ui.Holder(MT.ui.position.BOTTOM, this.events);
			this.bottom.height = 32;
			this.bottom.addLeft(this.left);
			this.bottom.resizeable = false;
			this.bottom.show(document.body);
			
			
			//this.left.addBottom(this.bottom);
			
			this.right = new MT.ui.Holder(MT.ui.position.RIGHT, this.events);
			
			this.right.addTop(this.top);
			//this.right.addBottom(this.bottom);
			this.right.width = 320;
			this.right.show(document.body);
			
			
			this.bottom.addRight(this.right);
			
			this.addPanels();
		},
		
		addPanel: function(name, parent){
			var panel = new MT.ui.Panel(name, this.events);
			
			var parent = parent || this.right;
			
			parent.addPanel(panel);
			
			return panel;
		},
   
		addPanels: function(){
			
			/*
			this.panels = {
				top: null,//new MT.ui.Panel(this.events),
				left: new MT.ui.Panel("Untitled",this.events)
			};
			
			//this.top.addPanel(this.panels.top);
			
			this.right.addPanel(this.panels.left);
			this.right.addPanel(new MT.ui.Panel("Untitled2",this.events));
			*/
		},
		
		addEvents: function(){
			
			var that = this;
			this.top.onupdate(function(){
				that.left.setPosition();
				that.right.setPosition();
			});
			this.bottom.onupdate(function(){
				//that.left.setPosition();
				//that.right.setPosition();
				that.alignCenter();
			});
			this.left.onupdate(function(){
				that.alignCenter();
				that.right.setPosition();
				
			});
			this.right.onupdate(function(){
				that.alignCenter();
				that.bottom.setPosition();
			});
			
		},
		
		addCenter: function(){
			this.center = document.createElement("div");
			this.center.style.position = "absolute";
			this.center.style.backgroundColor = "rgba(0,255,0,0.5)";
			this.center.className = "center";
			document.body.appendChild(this.center);
			
			this.alignCenter();
		},
		
		alignCenter: function(){
			this.center.style.top = this.top.el.offsetHeight + "px";
			this.center.style.bottom = this.bottom.height + "px";
			this.center.style.left = this.left.width + "px";
			this.center.style.right = this.right.width + "px";
			
			this.top.updateChildren();
			
			for(var i=0; i<this._onResize.length; i++){
				this._onResize[i]();
			}
			
			
		}
	   
	   
	}
);
