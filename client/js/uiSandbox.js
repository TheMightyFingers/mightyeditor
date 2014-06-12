"use strict";
window.MT = createClass("MT");
MT.require("ui.Controller");
MT.onReady(main);


var p = {};
function createPanel(name, content, width, height, x, y){
	width = width || 300;
	height = height  || 400;
	x = x || 0;
	y = y || 0;
	
	var panel = p[name] = ui.createPanel("Panel "+ name, width, height);
	ui.setMoveable(panel);
	ui.setDockable(panel);
	ui.setResizeable(panel);
	
	panel.x = x;
	panel.y = y;
	
	panel.content.el.innerHTML = content;
}

function main(){
	var ui = window.ui = new MT.ui.Controller();
	
	for(var i=0; i<4; i++){
		createPanel("p"+i, "this is panel number: "+i, 
					250, 
					350, 
					200*i,
					200*i
		);
	}
	
	ui.joinPanels(p.p0, p.p1);
	ui.joinPanels(p.p2, p.p3);
	
}