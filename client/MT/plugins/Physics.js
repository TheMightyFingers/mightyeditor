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
				console.log("change", val);
				if(val){
					that.buildPropTree();
				}
				else{
					that.addEmptyInput();
				}
			});
			
			
			var cb = function(val){
				that.change(val);
			};
			
			var tmp = {};
			
			this.inputs = {
				immovable: new MT.ui.Input(ui, {
					key: "immovable",
					type: "bool",
				}, tmp),
				
				// gravity
				gravityX: new MT.ui.Input(ui, {
					key: "x",
					type: "number",
				}, tmp),
				gravityY: new MT.ui.Input(ui, {
					key: "y",
					type: "number",
				}, tmp),
				
				bounce: new MT.ui.Input(ui, {
					key: "bounce",
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
				
				
				// limits
				maxVelocity: new MT.ui.Input(ui, {
					key: "maxVelocity",
					type: "number",
				}, tmp),
				
			};
			
			
			for(var i in this.inputs){
				this.inputs[i].on("change", cb);
			}
			
			
			/*
			
			immovable - 1/0
			bounce: 0 - 1
			gravity -> x/y
			
			size: {
				width: 
				height:
				offset -> x/y
			}
			mass
			maxVelocity
			maxAngular
			allowRotation : 0 / 1
			
			*/
			
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
				bounce: 1,
				gravity: {
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
				mass: 1
			}
			
		},
		
		addEmptyInput: function(){
			// remove all inputs;
			this.clear();
			this.empty.show(this.panel.content.el);
		},
		
		change: function(val){
			
		},
		
		buildPropTree: function(){
			if(!this.activeObject.physics.enable){
				this.clear();
				return;
			}
			
			if(this.activeObject.physics.immovable == void(0)){
				this.activeObject.physics = this.getTemplate(true);
			}
			
			var o = this.activeObject.physics;
			
			this.empty.setObject(o);
			this.empty.show(this.panel.content.el);
			
			this.inputs.immovable.setObject(o);
			this.inputs.immovable.show(this.panel.content.el);
			
			this.inputs.bounce.setObject(o);
			this.inputs.bounce.show(this.panel.content.el);
			
			var f = this.addFieldset("gravity");
			
			this.inputs.gravityX.setObject(o.gravity);
			this.inputs.gravityX.show(f);
			
			this.inputs.gravityY.setObject(o.gravity);
			this.inputs.gravityY.show(f);
			
			f = this.addFieldset("size");
			
			this.inputs.width.setObject(o.size);
			this.inputs.width.show(f);
			
			this.inputs.height.setObject(o.size);
			this.inputs.height.show(f);
			
			this.inputs.offsetX.setObject(o.size);
			this.inputs.offsetX.show(f);
			
			this.inputs.offsetY.setObject(o.size);
			this.inputs.offsetY.show(f);
			
			
			
			f = this.addFieldset("rotation");
			
			this.inputs.allowRotation.setObject(o.rotation);
			this.inputs.allowRotation.show(f);
			
			this.inputs.maxAngular.setObject(o.rotation);
			this.inputs.maxAngular.show(f);
			
			this.inputs.maxVelocity.setObject(o);
			this.inputs.maxVelocity.show(this.panel.content.el);
			
			this.inputs.mass.setObject(o);
			this.inputs.mass.show(this.panel.content.el);
			
			/*
			this.inputs.immovable.setObject(o, true);
			this.inputs.immovable.setObject(o, true);
			this.inputs.immovable.setObject(o, true);
			this.inputs.immovable.setObject(o, true);
			*/
			
			
			console.log("createTree", p);
		},
		
		sets: {},
		addFieldset: function(title){
			
			if(this.sets[title]){
				this.panel.content.el.appendChild(this.sets[title]);
				return this.sets[title];
			}
			
			var f = document.createElement("fieldset");
			var l = document.createElement("legend");
			f.appendChild(l);
			
			l.innerHTML = title;
			
			this.panel.content.el.appendChild(f);
			
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
			
			var updateData = function(obj){
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
			
			tools.on(MT.ASSET_FRAME_CHANGED, updateData);
			tools.on(MT.OBJECT_SELECTED, updateData);
			
			this.ui.joinPanels(this.project.plugins.settings.panel, this.panel);
			this.project.plugins.settings.panel.show();
		}
		
	}
);