/*
 * This file is automatically loaded from state/load.js
 * to change default state - change state/load.js at line: 34
 */
"use strict";
window["%namespace%"].state.demo = {
	create: function(){
		// create all objects
		var all = mt.createAll();
		
		// prevent pause on focus lost
		this.game.stage.disableVisibilityChange = true;
		
		// start __main movie for all objects
		for(var i in all){
			if(all[i].movies && all[i].movies.__main){
				all[i].movies.__main.start().loop();
			}
		}
	}
};