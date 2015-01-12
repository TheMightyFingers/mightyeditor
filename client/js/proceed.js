if(window.session && window.opener.auth){
	window.opener.auth(window.session);
}
window.close();