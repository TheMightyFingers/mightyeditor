"use strict";
MT.extend("core.BasicPlugin")(
	MT.plugins.Physics = function(project){
		this.project = project;
		this.activeObject = null;
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.panel = ui.createPanel("physics");
			this.panel.setFree();
			this.empty = new MT.ui.Input(ui, {type: "bool", key: "enable"}, {enable: 0});
			
			var that = this;
			this.empty.on("change", function(val){
				if(val){
					that.buildPropTree();
				}
				else{
					that.addEmptyInput();
				}
				om.sync();
			});
			
			var om = this.project.plugins.objectmanager;
			var cb = function(val){
				that.change(val);
				that.buildPropTree();
				om.sync();
			};
			
			var tmp = {};
			
			this.inputs = {
				immovable: new MT.ui.Input(ui, {
					key: "immovable",
					type: "bool",
				}, tmp),
				
				// gravity
				allowGravity: new MT.ui.Input(ui, {
					key: "allow",
					type: "bool",
				}, tmp),
				
				gravityX: new MT.ui.Input(ui, {
					key: "x",
					type: "number",
				}, tmp),
				gravityY: new MT.ui.Input(ui, {
					key: "y",
					type: "number",
				}, tmp),
				
				bounceX: new MT.ui.Input(ui, {
					key: "x",
					type: "number",
					min: 0,
					step: 0.1
				}, tmp),
				
				bounceY: new MT.ui.Input(ui, {
					key: "y",
					type: "number",
					min: 0,
					step: 0.1
				}, tmp),
				
				// rotation
				allowRotation: new MT.ui.Input(ui, {
					key: "allowRotation",
					type: "bool"
				}, tmp),
				maxAngular: new MT.ui.Input(ui, {
					key: "maxAngular",
					type: "number",
				}, tmp),
				
				
				// body
				width: new MT.ui.Input(ui, {
					key: "width",
					type: "number",
				}, tmp),
				height: new MT.ui.Input(ui, {
					key: "height",
					type: "number",
				}, tmp),
				offsetX: new MT.ui.Input(ui, {
					key: "offsetX",
					type: "number",
				}, tmp),
				offsetY: new MT.ui.Input(ui, {
					key: "offsetY",
					type: "number",
				}, tmp),
				
				mass: new MT.ui.Input(ui, {
					key: "mass",
					type: "number",
				}, tmp),
				
				collideWorldBounds: new MT.ui.Input(ui, {
					key: "collideWorldBounds",
					type: "number",
				}, tmp),
				
				// limits
				maxVelocity: new MT.ui.Input(ui, {
					key: "maxVelocity",
					type: "number",
				}, tmp),
				
			};
			
			
			for(var i in this.inputs){
				this.inputs[i].on("change", cb);
			}
			
			
			this.createFieldset("gravity");
			this.createFieldset("size");
			this.createFieldset("rotation");
		},
		getTemplate: function(isFull){
			if(isFull == void(0)){
				return {
					enable: 0
				};
			}
			
			return {
				enable: 1,
				immovable: 1,
				bounce: {
					x: 1,
					y: 1
				},
				gravity: {
					allow: 1,
					x: 0,
					y: 0
				},
				size: {
					width: -1,
					height: -1,
					offsetX: 0,
					offsetY: 0
				},
				rotation: {
					allowRotation: 0,
					maxAngular: 0
				},
				maxVelocity: 0,
				mass: 1,
				collideWorldBounds: 0
			}
			
		},
		
		addEmptyInput: function(){
			// remove all inputs;
			this.clear();
			this.empty.show(this.panel.content.el);
		},
		
		change: function(val){
			
		},
		_gravityBreak: null,
		get gravityBreak(){
			if(!this._gravityBreak){
				this._gravityBreak = document.createElement("br");
			}
			return this._gravityBreak;
		},
		buildPropTree: function(){
			this.clear();
			
			if(!this.activeObject.physics.enable){
				return;
			}
			
			if(this.activeObject.physics.immovable == void(0)){
				this.activeObject.physics = this.getTemplate(true);
			}
			
			var o = this.activeObject;
			var p = o.physics;
			var f;
			
			this.empty.setObject(p);
			this.empty.show(this.panel.content.el);
			
			this.inputs.immovable.setObject(p);
			this.inputs.immovable.show(this.panel.content.el);
			
			
			
			f = this.addFieldset("size");
			
			this.inputs.width.setObject(p.size);
			this.inputs.width.show(f);
			
			this.inputs.height.setObject(p.size);
			this.inputs.height.show(f);
			
			this.inputs.offsetX.setObject(p.size);
			this.inputs.offsetX.show(f);
			
			this.inputs.offsetY.setObject(p.size);
			this.inputs.offsetY.show(f);
			
			if(!p.immovable){
				
				f = this.addFieldset("bounce");
				if(typeof p.bounce != "object"){
					p.bounce = {x: 1, y: 1};
				}
				
				this.inputs.bounceX.setObject(p.bounce);
				this.inputs.bounceX.show(f);
				
				this.inputs.bounceY.setObject(p.bounce);
				this.inputs.bounceY.show(f);
				
				
				f = this.addFieldset("gravity");
				if(p.gravity.allow == void(0)){
					p.gravity.allow = 1;
				}
				this.inputs.allowGravity.setObject(p.gravity);
				this.inputs.allowGravity.show(f);
				if(p.gravity.allow){
					f.appendChild(this.gravityBreak);
					this.inputs.gravityX.setObject(p.gravity);
					this.inputs.gravityX.show(f);
				
					this.inputs.gravityY.setObject(p.gravity);
					this.inputs.gravityY.show(f);
				}
				else{
					if(this.gravityBreak.parentNode){
						this.gravityBreak.parentNode.removeChild(this.gravityBreak);
					}
				}
				f = this.addFieldset("rotation");
				
				this.inputs.allowRotation.setObject(p.rotation);
				this.inputs.allowRotation.show(f);
				
				this.inputs.maxAngular.setObject(p.rotation);
				this.inputs.maxAngular.show(f);
				
				this.inputs.maxVelocity.setObject(p);
				this.inputs.maxVelocity.show(this.panel.content.el);
				
				this.inputs.mass.setObject(p);
				this.inputs.mass.show(this.panel.content.el);
				
				
				if(p.collideWorldBounds == void(0)){
					p.collideWorldBounds = 0;
				}
				this.inputs.collideWorldBounds.setObject(p);
				this.inputs.collideWorldBounds.show(this.panel.content.el);
			}
		},
		
		sets: {},
		addFieldset: function(title){
			if(this.sets[title]){
				this.panel.content.el.appendChild(this.sets[title]);
				return this.sets[title];
			}
			
			var f = this.createFieldset(title);
			this.panel.content.el.appendChild(f);
			return f;
		},
		
		createFieldset: function(title){
			if(this.sets[title]){
				return;
			}
			var f = document.createElement("fieldset");
			var l = document.createElement("legend");
			f.appendChild(l);
			
			l.innerHTML = title;
			
		
			this.sets[title] = f;
			
			return f;
		},
		
		clear: function(){
			this.empty.hide();
			for(var i in this.inputs){
				this.inputs[i].hide();
			}
			for(var i in this.sets){
				if(this.sets[i].parentNode){
					this.sets[i].parentNode.removeChild(this.sets[i]);
				}
			}
		},
		
		installUI: function(){
			var plugins = this.project.plugins;
			var tools = plugins.tools;
			var that = this;
			var map = this.project.plugins.mapeditor;
			
			
			var updateData = function(obj){
				map.updateScene(map.settings);
				if(obj){
					that.activeObject = obj;
				}
				else{
					that.activeObject = null;
					return;
				}
				if(!obj.physics){
					obj.physics = that.getTemplate();
					that.empty.setObject(obj.physics);
					that.addEmptyInput();
				}
				else if(!obj.physics.enable){
					obj.physics.enable = 0;
					
					that.empty.setObject(obj.physics);
					that.addEmptyInput();
				}
				else{
					that.buildPropTree(obj.physics);
				}
			};
			
			this.ui.events.on("keyup", function(e){
				if(e.which == MT.keys.ESC){
					that.clear();
				}
			});
			
			map.on("select", function(obj){
				updateData(map.settings);
			});
			
			tools.on(MT.ASSET_FRAME_CHANGED, updateData);
			tools.on(MT.OBJECT_SELECTED, function(mo){
				updateData(mo.data);
			});
			
			tools.on(MT.OBJECT_UNSELECTED, function(){
				that.clear();
			});
			
			this.ui.joinPanels(this.project.plugins.settings.panel, this.panel);
			this.project.plugins.settings.panel.show();
			
		}
		
	}
);