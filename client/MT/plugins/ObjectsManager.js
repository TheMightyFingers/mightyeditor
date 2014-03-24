MT.require("ui.TreeView");
MT.require("ui.List");

MT.extend("core.BasicPlugin")(
	MT.plugins.ObjectsManager = function(project){
		MT.core.BasicPlugin.call(this, "ObjectsManager");
		this.project = project;
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.panel = ui.addPanel("Objects");
			
			var that = this;
			
			this.list = new MT.ui.List([
				{
					label: "new group",
					className: "",
					cb: function(){
						that.newFolder();
					}
				}
			
			], ui);
			
			this.options = new MT.ui.Button(null, "ui-options", ui.events, function(){
				if(!that.list.isVisible){
					that.list.show(that.panel.content.el);
				}
				else{
					that.list.hide();
				}
			});
			
			
			this.panel.header.addChild(this.options);
			this.options.style.width = "33px";
			this.options.style.left = "auto";
			
			this.tv = new MT.ui.TreeView([], this.project.path);
			this.tv.onChange = function(oldItem, newItem){
				console.log("change", oldItem, newItem);
				that.updateData();
			};
			
			this.tv.sortable(this.ui.events);
			this.tv.tree.show(this.panel.content.el);
			
			
			
		},
		
		a_receive: function(list){
			this.buildObjectsTree(list);
			
			this.project.map.addObjects(this.tv.getData());
			
		},
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
		},
		
		//add object from asset
		addObject: function( e, obj ){
			var data = this.tv.getData();
			///data.fullPath = data.name;
			if(obj.contents){
				return;
			}
			
			var name = obj.name.split(".");
			name.pop();
			name = name.join("");
			
			name += this.getNewNameId(name, data);
			
			
			
			var no = {
				__image: obj.__image,
				x: e.offsetX,
				y: e.offsetY,
				anchorX: 0.5,
				anchorY: 0.5,
				rotation: 0,
				alpha: 1,
				name: name
			};
			
			data.push(no);
			
			this.tv.rootPath = this.project.path
			this.tv.merge(data);
			this.updateData(data);
		},
		
		
		getNewNameId: function(name, data, id){
			id = id || 0;
			var tmpName = name;
			if(id > 0){
				tmpName += id;
			}
			
			
			for(var i=0; i<data.length; i++){
				if(data[i].name == tmpName){
					id++;
					id = this.getNewNameId(name, data, id);
				}
			}
			
			return (id > 0 ? id : "");
		},
		
		buildObjectsTree: function(list){
			var that = this;
			this.tv.rootPath = this.project.path;
			this.tv.merge(list);
			
			this.tv.tree.show(this.panel.content.el);
		},
		
		moveFile: function(a, b){
			this.send("moveFile", {
				a: a,
				b: b
			});
		},
		
		updateData: function(){
			
			var data = this.tv.getData();
			this.send("updateData", data);
		},
		
		newFolder: function(){
			var data = this.tv.getData();
			
			var tmpName= "Group";
			var name = tmpName;
			for(var i=0; i<data.length; i++){
				if(data[i].name == name){
					name = tmpName+" "+i;
				}
			}
			
			data.unshift({
				name: name,
				contents: []
			});
			
			this.tv.merge(data);
			
			this.updateData();
		}
	}
);
