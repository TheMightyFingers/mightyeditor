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
				that.updateData();
			};
			
			this.tv.sortable(this.ui.events);
			this.tv.tree.show(this.panel.content.el);
			
			this.ui.events.on("mouseup", function(){
				console.log("mouseup");
			});
			
			
		},
		
		a_receive: function(list){
			this.buildObjectsTree(list);
			
			this.project.map.addObjects(this.tv.getData());
			
		},
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
		},
		
		addObject: function( e, obj ){
			var data = this.tv.getData();
			///data.fullPath = data.name;
			if(obj.contents){
				return;
			}
			
			var no = {};
			for(var i in obj){
				no[i] = obj[i];
			}
			no.x = e.offsetX;
			no.y = e.offsetY;
			
			
			
			data.push(no);
			
			this.tv.rootPath = this.project.path
			this.tv.merge(data);
			this.updateData(data);
			
			
			
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
