/*
MT - stands for MightyTools main MightyEditor helper
it's responsible for the extending objects and automatic source downloading

usage:
MT.extend(PARENT_CLASS).extend(ANOTHER_PARENT_CLASS)(CONSTRUCTOR, PROTOTYPE);

PARENT_CLASS - can be another objects constructor (Class) or a string
in case of the string MT - will download corresponding source files automatically

e.g.

// Human.js
MT(
	MT.Human = function(name){
		this.name = name;
	},
	{
		walk: function(){
			console.log(this.name + " is walking");
		},
		run: function(){
			console.log(this.name + " is running");
		}
		
	}
);

// Ninja.js
MT.extend("Human")(
	MT.Ninja = function(name){
		// call human constructor
		MT.Human.call(this)
	},
	{
		// add new method
		kick: function(){
			console.log(this.name + " performs ninja kick");
		},
		
		// override existing method
		run: function(){
			console.log(this.name + " is running silently"):
		}
	}
);

*/

// to use Ninja in your script
//MT.require("Ninja");// MT will download automatically Ninja.js and Human.js

// to download custom library:
//MT.requireFile("/js/libs/jQuery.js");


// CustomPlugin.js
MT.extend("core.BasicPlugin")(
	MT.plugins.DemoPlugin = function(project){
		this.project = project;
		
		// check if project has our data container defined - define if not
		if(!this.project.data.demoData){
			this.project.data.demoData = {
				number: 7
			};
		}
		this.data = this.project.data.demoData;
	},
	{
		// this method is called when MightyEditor UI manager will become ready - another plugins ( this.project.plugins ) isn't available here
		initUI: function(ui_controller){
			// usually it's good thing to save reference to ui_controller (just ui - to be shorter)
			this.ui = ui_controller;
			
			// create our plugins panel
			this.panel = this.ui.createPanel("DemoPlugin"); // Demo - is panel's name - should be uniquie.. otherwise ui controller will throw an error
			
			// make panel dragable and resizeable
			this.panel.setFree();
			
			// to remove title bar: ( e.g. for panels like TextTool )
			// this.panel.removeHeader();
		},
		
		// this method is called for each plugin after all plugins has been initialised
		installUI: function(){
			
			// here we can access another plugins
			// e.g. we would like to connect to the mapeditor -> phaser -> canvas directly..
			
			this.map = this.project.plugins.mapeditor;
			var game = this.game = this.map.game;
			// lets add custom plugin to the phasers game
			this.game.add.plugin({
				render: function(){
					game.context.fillRect(0,0,100,100);
				}
			});
			
			
			// edit panel content - as simple html element
			var panelElement = this.panel.content.el;
			panelElement.innerHTML = "HELLO WORLD!";
			
			// add input to our panel
			// e.g. to change this.data.number property
			
			var self = this;
			this.input = new MT.ui.Input(this.ui, {key: "number"}, this.data, function(newVal, oldVal){
				console.log("CustomPlugin data changed to", newVal);
				self.saveData();
			});
			// show input
			this.input.show(panelElement);
		},
		
		saveData: function(){
			console.log("saving data", JSON.stringify(this.data));
			
			// tell project manager to save all data
			this.project.send("saveProjectInfo", this.project.data);
		}
	}
);
