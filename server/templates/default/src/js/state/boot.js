"use strict";
window["%namespace%"].state.boot = {
	preload: function(){
		// set world size
		this.game.world.setBounds(0, 0, mt.data.map.worldWidth, mt.data.map.worldHeight);
		
		// enable resize
		this.enableFitScreen();
		
		//init mt helper
		mt.init(this.game);
		
		//set background color - true (set also to document.body)
		mt.setBackgroundColor(true);
		
		// load assets for the Loading group ( if exists )
		mt.loadGroup("Loading");
	},
	create: function(){
		// add all game states
		for(var stateName in window["%namespace%"].state){
			this.game.state.add(stateName, window["%namespace%"].state[stateName]);
		}
		
		// goto load state
		this.game.state.start("load");
	},
	
	
	// reference to fit screen function - used to remove resize later
	_fitScreen: null,
	enableFitScreen: function(){
		var game = this.game;
		
		var resizeGame = this._fitScreen = function() {
			game.scale.setShowAll();
			game.scale.refresh();
		};
		
		window.addEventListener('resize', resizeGame, false);
		
		resizeGame();
	},
	disableFitScreen: function(){
		window.removeEventListener('resize', this._fitScreen);
	}
};
