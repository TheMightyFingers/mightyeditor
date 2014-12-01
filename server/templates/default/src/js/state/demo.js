"use strict";
window["%namespace%"].state.demo = {
	create: function(){
		var all = mt.createAll();
		this.game.stage.disableVisibilityChange = true;
		for(var i in all){
			if(all[i].movies && all[i].movies.__main){
				all[i].movies.__main.start().loop();
			}
		}
	}
};