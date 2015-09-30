"use strict";
MT.requireFile("MT/misc/validation.js");
MT.require("ui.InputCollection");
MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.Auth = function(project){
		MT.core.BasicPlugin.call(this, "Auth");
		this.project = project;
		this.sessionCookie = "MightyEditor";
		this.currency = "$";
	},
	{
		_isLogged: false,
		set isLogged(val){
			this._isLogged = val;
		},
		
		get isLogged(){
			return this._isLogged;
		},
		
		initSocket: function(socket, cb){
			if(this.socket){
				return;
			}
			MT.core.BasicPlugin.initSocket.call(this, socket);
			this.onstart = cb;
			this.checkSession();
		},
		
		signOut: function(){
			MT.core.Helper.setCookie(this.sessionCookie, "");
			this.send("logout");
			window.location = window.location.toString().split("#")[0];
		},
		
		// server requests login to open a project
		a_login: function(cmd){
			this.showLogin(true);
			var that = this;
			this.onlogin = function(){
				that.execCmd(cmd);
			}
		},
		execCmd: function(cmd){
			this.hideLoading();
			this.hideLogin();
			
			if(typeof cmd == "function"){
				cmd();
				return;
			}
			
			if(this[cmd.domain]){
				this[cmd.domain][cmd.action].apply(this[cmd.domain], cmd.arguments);
			}
		},
		a_permissionChanged: function(){
			console.log("project permissions has changed");
		},
		standAlone: false,
		showLogin: function(standAlone){
			if(standAlone){
				this.standAlone = true;
				document.body.appendChild(this.loginContainer);
				MT.ui.addClass(this.loginContainer, "standAlone");
				MT.ui.addClass(document.body, "login");
				
				this.showLogo();
				return;
			}
			else{
				this.hideLogo();
				MT.ui.removeClass(this.loginContainer, "standAlone");
				MT.ui.removeClass(document.body, "login");
			}
			
			if(this.loginContainer.parentNode == document.body){
				document.body.removeChild(this.loginContainer);
				if(this.mainButton){
					this.mainButton.removeClass("active");
				}
				MT.core.Helper.clearSelection();
				return;
			}
			document.body.appendChild(this.loginContainer);
			
			var that = this;
			
			this.ui.events.once("click", function(){
				that.hideLogin();
			});
			
			this.mainButton.addClass("active");
			return;
		},
		hideLogin: function(){
			if(this.loginContainer.parentNode){
				this.loginContainer.parentNode.removeChild(this.loginContainer);
				if(this.mainbutton){
					this.mainButton.removeClass("active");
				}
				MT.core.Helper.clearSelection();
			}
		},
		
		showLogo: function(){
			this.hideLogo();
			this.loginContainer.firstChild.insertBefore(this.logo, this.loginContainer.firstChild.firstChild);
		},
		hideLogo: function(){
			if(this.logo.parentNode){
				this.logo.parentNode.removeChild(this.logo);
			}
		},
		showProperties: function(){
			if(!this.propContainer){
				this.buildPropContainer();
			}
			
			if(this.propContainer.parentNode == document.body){
				document.body.removeChild(this.propContainer);
				this.mainButton.removeClass("active");
				MT.core.Helper.clearSelection();
				return;
			}
			
			var that = this;
			this.mainButton.addClass("active");
			var up = this.mouseUp = function(e){
				if(e && MT.ui.hasParent(e.target, that.propContainer)){
					return;
				}
				if(that.propContainer.parentNode){
					that.propContainer.parentNode.removeChild(that.propContainer);
					that.mainButton.removeClass("active");
					MT.core.Helper.clearSelection();
					that.emit("hideProperties", that.propPanels.projects);
				}
				that.ui.events.off("mouseup", up);
				
			};
			this.ui.events.on("mouseup", up);
			
			document.body.appendChild(this.propContainer);
			if(this.logoutButton.el.parentNode){
				this.logoutButton.el.parentNode.removeChild(this.logoutButton.el);
			}
			this.propContainer.appendChild(this.logoutButton.el);
			
			this.emit("showProperties", this.propPanels.projects);
			
			this.propPanels.projects.hide();
			
		},
		initUI: function(ui){
			this.ui = ui;
			var that = this;
			var title = "My Mighty";
			if(!this.isLogged){
				title = "Sign In";
			}
			
			this.mainButton = this.project.panel.addButton(title, "ui-login", function(e){
				if(!that.isLogged){
					that.showLogin();
				}
				else{
					that.showProperties();
				}
			});
		},
		
		buildPropContainer: function(){
			var that = this;
			this.propContainer = document.createElement("div");
			this.propContainer.panel = this.panel;
			this.propContainer.onclick = function(e){
				e.stopPropagation();
			};
			
			this.propContainer.className = "ui-mysettings";
			// create panels
			
			this.propPanels = {};
			
			this.propPanels.share = this.ui.createPanel("Share Project");
			this.propPanels.share.hide();
			this.propPanels.share.fitIn();
			
			this.buildShareOptions(this.propPanels.share.content.el);
			
			this.propPanels.projects = this.buildMyProjects();
			this.propPanels.projects.fitIn();
			
			this.propPanels.share.addJoint(this.propPanels.projects);
			this.propPanels.share.show(this.propContainer);
		},
		
		_myProjectsPanel: null,
		buildMyProjects: function(){
			if(this._myProjectsPanel){
				return this._myProjectsPanel;
			}
			var p = this.ui.createPanel("My Projects");
			
			
			var list = this.project.makeProjectList(this.projects, function(id, cb){
				that.deleteProject(id, cb);
			});
			p.content.el.appendChild(list);
			
			return p;
		},
		
		buildShareOptions: function(el){
			var that = this;
			this.send("getShareOptions", null, function(options){
				if(options == void(0)){
					that.buildCopyToAccessPermissions(el);
					return;
				}
				
				that.userId = options.userId;
				if(!options){
					console.log("cannot get options", options);
					return;
				}
				
				if(options.action == "goPro"){
					that.buildGoPro(el);
					return;
				}
				
				if(options.action == "pending"){
					that.buildPending(el);
					return;
				}
				
				that.shareOptions = options;
				that.buildShareEmailOptions(el, that.shareOptions.emails);
				that.buildAllowCopy(el);
				that.buildProjectLink(el);
			});
		},
		
		
		buildProjectLink: function(el){
			var f = document.createElement("fieldset");
			
			var leg = document.createElement("legend");
			leg.innerHTML = "Share by link";
			f.appendChild(leg);
			
			var link = document.createElement("span");
			link.appendChild(document.createTextNode(window.location));
			link.className = "selectable";
			
			link.onclick = function(e){
				MT.core.Helper.select(link);
				e.stopPropagation();
			};
			var help = document.createElement("div");
			help.className = "help-text";
			help.appendChild(document.createTextNode("This option grants access to the project for everyone with the link"));
			f.appendChild(help);
			
			var checkbox = document.createElement("input");
			checkbox.setAttribute("type", "checkbox");
			checkbox.className = "project-link";
			f.appendChild(checkbox);
			
			if(this.shareOptions.shareWithLink){
				checkbox.setAttribute("checked","checked");
				f.appendChild(link);
			}
			var that = this;
			checkbox.onchange = function(){
				if(this.checked){
					f.appendChild(link);
					MT.core.Helper.select(link);
				}
				else if(link.parentNode){
					f.removeChild(link);
				}
				that.shareOptions.shareWithLink = this.checked ? 1 : 0;
				that.saveProjectShareOptions();
			};
			
			el.appendChild(f);
		},
		
		buildAllowCopy: function(el){
			var f = document.createElement("fieldset");
			
			var leg = document.createElement("legend");
			leg.innerHTML = "Allow copy";
			f.appendChild(leg);
			
			var link = document.createElement("span");
			link.appendChild(document.createTextNode(window.location.toString()+"-copy"));
			
			link.className = "selectable";
			
			link.onclick = function(e){
				MT.core.Helper.select(link);
				e.stopPropagation();
			};
			
			var help = document.createElement("div");
			help.className = "help-text";
			help.appendChild(document.createTextNode("This option allows to make a copy of your project without affecting your project. e.g. if you are creating tutorial"));
			f.appendChild(help);
			
			var checkbox = document.createElement("input");
			checkbox.setAttribute("type", "checkbox");
			
			checkbox.className = "project-link";
			f.appendChild(checkbox);
			
			if(this.shareOptions.allowCopy){
				checkbox.setAttribute("checked","checked");
				f.appendChild(link);
			}
			var that = this;
			checkbox.onchange = function(){
				if(this.checked){
					f.appendChild(link);
					MT.core.Helper.select(link);
				}
				else if(link.parentNode){
					f.removeChild(link);
				}
				
				that.shareOptions.allowCopy = this.checked ? 1 : 0;
				that.saveProjectShareOptions();
			};
			
			el.appendChild(f);
		},
		
		buildShareEmailOptions: function(el, emails){
			
			var f = document.createElement("fieldset");
			f.onclick = function(e){
				e.preventDefault();
				e.stopPropagation();
				input.focus();
			};
			var leg = document.createElement("legend");
			leg.innerHTML = "Share by email";
			f.appendChild(leg);
			
			var help = document.createElement("div");
			help.className = "help-text";
			help.appendChild(document.createTextNode("Enter list of email addresses - to allow access to your project"));
			f.appendChild(help);
			
			var list = document.createElement("span");
			this.buildEmailList(list, emails);
			f.appendChild(list);
			
			var input = document.createElement("input");
			input.className = "share-email-input";
			input.onmousedown = function(e){
				e.stopPropagation();
			};
			var that = this;
			input.onkeydown = function(e){
				if(e.which == MT.keys.ENTER || e.which == MT.keys.TAB){
					if(!input.value){
						return;
					}
					that.addEmail(list, input.value);
					input.value = "";
					e.preventDefault();
				}
				else if(e.which == MT.keys.ESC){
					input.value = "";
				}
			};
			f.appendChild(input);
			
			/*
			var button = new MT.ui.Button("Invite", "small", null, function(){
				console.log("send Invitation");
			});
			f.appendChild(button.el);
			*/
			el.appendChild(f);
		},
		addEmail: function(list, email){
			if(this.shareOptions.emails.indexOf(email) > -1){
				return;
			}
			
			list.appendChild(this.buildEmail(email));
			this.shareOptions.emails.push(email);
			this.saveProjectShareOptions();
		},
		removeEmail: function(el, email){
			if(el.parentNode){
				el.parentNode.removeChild(el);
			}
			var index = this.shareOptions.emails.indexOf(email);
			this.shareOptions.emails.splice(index, 1);
			this.saveProjectShareOptions();
		},
		saveProjectShareOptions: function(){
			this.send("saveProjectShareOptions", this.shareOptions);
		},
		
		buildEmailList: function(list, emails){
			while(list.firstChild){
				list.removeChild(list.firstChild);
			}
			for(var i=0; i<emails.length; i++){
				list.appendChild(this.buildEmail(emails[i]));
			}
		},
		
		buildEmail: function(value){
			var h = document.createElement("span");
			var em = document.createElement("span");
			var rem = document.createElement("span");
			var that = this;
			
			h.appendChild(em);h.appendChild(rem);
			h.className = "email-entered";
			rem.className = "remove-button fa";
			em.appendChild(document.createTextNode(value));
			rem.innerHTML = "&#xf00d;";
			rem.onclick = function(){
				that.removeEmail(h, value);
			};
			var isValid = MT.misc.validation;
			if(!isValid.email(value)){
				h.className += " error"
			}
			
			return h;
		},
		
		
		buildPending: function(el){
			var pro = document.createElement("div");
			pro.className = "goPro";
			var top = document.createElement("div");
			top.className = "top";
			var title = document.createElement("div");
			title.className = "title";
			title.appendChild(document.createTextNode("Pending approval"));
			
			var desc = document.createElement("div");
			desc.className = "description";
			desc.appendChild(document.createTextNode("We haven't received payment approval from paypal. Please wait."));
			
			
			top.appendChild(title);
			top.appendChild(desc);
			
			pro.appendChild(top);
			el.appendChild(pro);
		},
		
		buildCopyToAccessPermissions: function(el){
			var pro = document.createElement("div");
			pro.className = "goPro";
			var top = document.createElement("div");
			top.className = "top";
			var title = document.createElement("div");
			title.className = "title";
			title.appendChild(document.createTextNode("This is not your project"));
			
			var desc = document.createElement("div");
			desc.className = "description";
			desc.innerHTML = 'This project belongs to another user - or has been created by an annonymous user. '+
														'You can <a href="'+window.location.origin+'/#'+this.project.id+'-copy" />clone</a> this project to make your own copy of this project.';
			
			
			top.appendChild(title);
			top.appendChild(desc);
			
			pro.appendChild(top);
			el.appendChild(pro);
		},
		
		buildGoPro: function(el){
			var pro = document.createElement("div");
			pro.className = "goPro";
			
			var top = document.createElement("div");
			top.className = "top";
			
			var title = document.createElement("div");
			title.className = "title";
			title.appendChild(document.createTextNode("Get a pro account"));
			
			
			var desc = document.createElement("div");
			desc.className = "description";
			desc.appendChild(document.createTextNode("To share projects privately and to change other project properties you should get a subscription. "+
													"If you choose to subscribe you will get all kinds of awesome goodies."));
			
			var middle = document.createElement("div");
			middle.className = "middle";
			
			var basic = this.buildSide("Basic", ["Game Hosting", "Advanced Sharing", "Never Expiring Projects"], 5, "basic");
			var advanced = this.buildSide("Advanced", ["All of the Basic", "Support", "Feature Request Priority"], 20, "advanced");
			
			top.appendChild(title);
			top.appendChild(desc);
			
			middle.appendChild(basic);
			middle.appendChild(advanced);
			var clear = document.createElement("div");
			clear.style.clear = "both";
			middle.appendChild(clear);
			
			
			pro.appendChild(top);
			pro.appendChild(middle);
			el.appendChild(pro);
		},
		
		buildSide: function(title, parts, price, extra){
			var cont = document.createElement("div");
			cont.className = "side "+extra;
			var label = document.createElement("div");
			label.className = "label";
			label.appendChild(document.createTextNode(title));
			cont.appendChild(label);
			
			
			
			var p;
			for(var i=0; i<parts.length; i++){
				p = document.createElement("div");
				p.appendChild(document.createTextNode(parts[i]));
				cont.appendChild(p);
			}
			
			var pr = document.createElement("div");
			pr.className = "price";
			pr.appendChild(document.createTextNode(price+this.currency));
			cont.appendChild(pr);
			
			var that = this;
			/*var button = new MT.ui.Button("Subscribe", "subscribe "+extra, null, function(){
				that.subscribe(price);
			});*/
			
			//5$ - Y4PZXZMZFA8NQ
			//test - WULA9EQ248NKS
			var ppbutton = document.createElement("div");
			ppbutton.className = "subscribe "+extra;
			if(price == 5){
				ppbutton.innerHTML = '<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">'+
										'<input type="hidden" name="cmd" value="_s-xclick">'+
										'<input type="hidden" name="hosted_button_id" value="Y4PZXZMZFA8NQ">'+
										'<input type="hidden" name="custom" value="'+this.userId+'">'+
										'<input type="hidden" name="notify_url" value="'+document.location.origin+'/paypal">'+
										'<input type="hidden" name="return" value="'+document.location.origin + '/return/paypal/'+this.userId+'/'+this.project.id+'">'+
										'<input type="hidden" name="invoice_id" value="'+Date.now()+'">'+
										'<input type="hidden" name="charset" value="utf-8">'+
										'<input type="image" src="http://mightyfingers.com/wp-content/uploads/2014/12/button_paypal.png" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">'+
									'</form>';
			}
			else{
				ppbutton.innerHTML = '<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">'+
										'<input type="hidden" name="cmd" value="_s-xclick">'+
										'<input type="hidden" name="hosted_button_id" value="Y433GXUFDCNNE">'+
										'<input type="hidden" name="custom" value="'+this.userId+'">'+
										'<input type="hidden" name="notify_url" value="'+document.location.origin+'/paypal">'+
										'<input type="hidden" name="return" value="'+document.location.origin + '/return/paypal/'+this.userId+'/'+this.project.id+'">'+
										'<input type="hidden" name="invoice_id" value="'+Date.now()+'">'+
										'<input type="hidden" name="charset" value="utf-8">'+
										'<input type="image" src="http://mightyfingers.com/wp-content/uploads/2014/12/button_paypal_2.png" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">'+
									'</form>';
			}
			
			cont.appendChild(ppbutton);
			
			//cont.appendChild(button.el);
			
			return cont;
		},
		
		
		deleteProject: function(id, cb){
			var that = this;
			var pop = new MT.ui.Popup("Delete Project?", "Do you really want to delete project?");
			
			pop.addButton("no", function(){
				pop.hide();
				cb(false);
			});
			
			pop.addButton("yes", function(){
				that.send("deleteProject", id);
				pop.hide();
				cb(true);
			});
			
			pop.showClose();
		},
		
		installUI: function(ui, pop){
			if(this.panel){
				
				if(this.project.id && this.userLevel === 0){
					this.showProperties();
				}
				
				return;
			}
			
			this.ui = ui;
			this.loginContainer = document.createElement("div");
			this.logo = document.createElement("div");
			this.logo.className = "login logo";
			
			this.loginContainer.onclick = function(e){
				e.stopPropagation();
			};
			
			this.loginContainer.className = "ui-mysettings";
			var that = this;
			
			var loginPanel = this.panel = this.ui.createPanel("Sign in");
			this.loginContainer.panel = this.panel;
			
			loginPanel.fitIn();
			loginPanel.removeBorder();
			loginPanel.hide();
			loginPanel.content.style.overflow = "hidden";
			loginPanel.content.style.perspective = "1000";
			
			
			this.signUpEl = new MT.ui.DomElement("div");
			this.signUpEl.addClass("signup");
			loginPanel.content.el.appendChild(this.loginContainer);
			this.loginContainer.appendChild(this.signUpEl.el);
			
			var form = document.createElement("form");
			form.onsubmit = function(e){
				e.preventDefault();
				e.stopPropagation();
				return false;
			};

			var prop = {
				email: "email",
				password: "password",
				passwordR: "password"
			};
			
			this.signUpEl.el.appendChild(form);
			
			var input = {};
			input.email = new MT.ui.Input(this.ui, {key: "email", type: "text"}, prop);
			input.email.show(form);
			input.email.input.id = "email";
			input.email.input.name = "email";
			
			input.password = new MT.ui.Input(this.ui, {key: "password", type: "password"}, prop);
			input.password.show(form);
			
			input.password.value.el.innerHTML = "Password";
			
			
			input.passwordR = new MT.ui.Input(this.ui, {key: "passwordR", type: "password"}, prop);
			input.passwordR.value.el.innerHTML = "Repeat Password";
			
			loginPanel.on("show", function(){
				input.email.enableInput();
			});
			
			var isRegProcess = false;
			var isResetInProgress = false;
			
			var submit = function(){
				if(isResetInProgress){
					that.resetPassword(input);
					return;
				}
				that.signIn(input, isRegProcess);
			};
			
			
			this.loginButton = new MT.ui.Button("Sign in", "login.mainbutton", null, submit);
			this.loginButton.show(form);
			
			input.password.input.onkeydown = input.passwordR.input.onkeydown = function(e){
				if(e.which == MT.keys.ENTER){
					submit();
				}
			};
			
			
			var flipped = false;
			
			this.flipBack = function(e, forceSignIn){
				that.signUpEl.removeClass("flipBack").addClass("flip");
				window.setTimeout(function(){
					that.signUpEl.removeClass("flip").addClass("flipBack");
					
					if(forceSignIn && !isResetInProgress){
						return;
					}
					
					
					if(isResetInProgress){
						that.loginButton.text = "Sign in";
						that.registerButton.text = "Need an account?";
						
						input.email.el.parentNode.insertBefore(input.password.el, input.email.el.nextSibling);
						isResetInProgress = false;
						isRegProcess = false;
					}
					else{
						
						
						if(!isRegProcess){
							input.password.el.parentNode.insertBefore(input.passwordR.el, input.password.el.nextSibling);
							//input.passwordR.e(that.signUpEl.el);
							that.registerButton.text = "Back";
							that.loginButton.text = "Register";
							
							isRegProcess = true;
						}
						else{
							input.passwordR.hide();
							that.registerButton.text = "Need an account?";
							that.loginButton.text = "Sign in";
							
							isRegProcess = false;
						}
					}
					
					window.setTimeout(function(){
						that.signUpEl.removeClass("flipBack");
					}, 500);
					
				}, 250);
				
				input.email.value.removeClass("error");
				input.password.value.removeClass("error");
			};
			
			this.registerButton = new MT.ui.Button("Need an account?", "register", null, this.flipBack);
			this.registerButton.show(form);
			
			
			this.forgotPassButton = new MT.ui.Button("Forgot password?", "resetPassword", null, function(){
				that.signUpEl.removeClass("flipBack").addClass("flip");
				window.setTimeout(function(){
					that.signUpEl.removeClass("flip").addClass("flipBack");
					
					if(!isResetInProgress){
						input.password.hide();
						input.passwordR.hide();
						
						that.registerButton.text = "Back";
						that.loginButton.text = "Reset";
						
						isResetInProgress = true;
					}
					else{
						input.email.el.parentNode.insertBefore(input.password.el, input.email.el.nextSibling);
						that.loginButton.text = "Sign in";
						isResetInProgress = false;
					}
					
					window.setTimeout(function(){
						that.signUpEl.removeClass("flipBack");
					}, 500);
					
				}, 250);
				
				input.email.value.removeClass("error");
				input.password.value.removeClass("error");
			});
			
			this.forgotPassButton.show(form);
			
			
			
			this.logoutButton = new MT.ui.Button("Sign out", "login.mainbutton.logout", null, function(){
				that.signOut(input);
			});
			
			this.errorMessage = document.createElement("div");
			this.errorMessage.className = "errorMessage";
			this.signUpEl.el.appendChild(this.errorMessage);
			
			
			this.social = new MT.ui.DomElement("div");
			this.social.addClass("social");
			
			var that = this;
			
			this.send("getSocialConfig", null, function(config){
				that.config = config;
				for(var i in config){
					that[i+"Button"] = that.addSocialButton(config[i], that.social.el);
				}
			});
			
			this.fPass = ForgotPassword(this.signUpEl.el);
			
			this.loginContainer.appendChild(this.social.el);
		},
		setError: function(msg){
			if(!this.errorMessage){
				return;
			}
			this.error(msg);
		},
		addSocialButton: function(config, parent){
			
			var url = this.buildUrl(config);
			var that = this;
			var b = new MT.ui.Button(config.label, "login."+config.name, null, function(){
				var conf = config;
				var w = conf.width;
				var h = conf.height;
				var l = (window.innerWidth - w)*0.5;
				var t = (window.innerHeight - h)*0.5;
				window.auth = function(data){
					that.send("checkSession", data);
					window.auth = null;
					that.showLoading();
				};
				var win = window.open(url, "signIn", "width=" + w + ", height=" + h + ", left=" + l + ", top=" + t);
				win.focus();
			});
			parent.appendChild(b.el);
			return b;
		},
		
		buildUrl: function(conf){
			var url = conf.url + "?";
			for(var i in conf.params){
				url += i + "=" + conf.params[i]+"&";
			}
			url = url.substring(0, url.length - 1);
			return url;
		},
		
		hideContainer: function(){
			
			if( this.loginContainer && this.loginContainer.parentNode){
				this.loginContainer.parentNode.removeChild(this.loginContainer);
			}
		},
		
		showLoading: function(){
			window.showLoading();
		},
		hideLoading: function(){
			window.hideLoading();
		},
		
		show: function(panel, show){
			panel.addJoint(this.panel);
			if(show){
				this.panel.show();
			}
		},
		
		showMainScreen: function(){
			// is visible?
			if(this.loginContainer.parentNode){
				return;
			}
			if(this.standAlone){
				document.body.appendChild(this.loginContainer);
			}
			else{
				this.panel.content.el.appendChild(this.loginContainer);
			}
		},
		
		error: function(msg){
			var par = this.errorMessage.parentNode;
			this.errorMessage.setAttribute("data-msg", msg);
			this.errorMessage.className = "errorMessage";
			
			par.removeChild(this.errorMessage);
			par.appendChild(this.errorMessage);
			
			var that = this;
			window.setTimeout(function(){
				that.errorMessage.className += " active";
			}, 1000);
		},
		
		signIn: function(input, signUp){
			var email = input.email.getValue();
			var pass = input.password.getValue();
			var passR = input.passwordR.getValue();
			
			input.email.value.removeClass("error");
			input.password.value.removeClass("error");
			
			var isValid = MT.misc.validation;
			
			var errors = false;
			if(!isValid.email(email)){
				input.email.value.addClass("error");
				input.email.value.el.setAttribute("data-error", "check email");
				errors = true;
				
				if(!input.email.validateFirstTime){
					input.email.validateFirstTime = true;
					input.email.on("change", function(val){
						if(isValid.email(val)){
							input.email.value.removeClass("error");
						}
						else{
							input.email.value.addClass("error");
						}
					});
				}
			}
			
			if(!isValid.password(pass)){
				input.password.value.addClass("error");
				input.password.value.el.setAttribute("data-error", "at least one number and at least six characters");
				errors = true;
				if(!input.password.validateFirstTime){
					input.password.validateFirstTime = true;
					input.password.on("change", function(val){
						if(isValid.password(val)){
							input.password.value.removeClass("error");
						}
						else{
							input.password.value.addClass("error");
						}
					});
				}
			}
			
			if(signUp){
				if(pass !== passR){
					input.passwordR.value.addClass("error");
					input.passwordR.value.el.setAttribute("data-error", "passwords don't match");
					errors = true;
				}
			}
			
			if(errors){
				return;
			}
			this.errorMessage.className = "errorMessage";
			this.showLoading();
			
			// no ssl - better than nothing
			pass = MT.core.Helper.sha256(pass);
			
			var that = this;
			this.send("register", {email: email, password: pass, signup: signUp}, function(isOK){
				that.hideLoading();
				if(!isOK){
					that.showMainScreen();
					that.error("Sign in failed!");
				}
				console.log(isOK ? "register success" : "register failed");
			});
			
		},
		
		resetPassword: function(input){
			var that = this;
			
			var email = input.email.getValue();
			var isValid = MT.misc.validation;
			
			if(!isValid.email(email)){
				input.email.value.addClass("error");
				input.email.value.el.setAttribute("data-error", "check email");
				
				if(!input.email.validateFirstTime){
					input.email.validateFirstTime = true;
					input.email.on("change", function(val){
						if(isValid.email(val)){
							input.email.value.removeClass("error");
						}
						else{
							input.email.value.addClass("error");
						}
					});
				}
				return;
			}
			
			this.send("resetPassword", email, function(err){
				that.hideLoading();
				if(err){
					that.showMainScreen();
					that.error("Unknown email address");
				}
				else{
					that.error("Instructions has sent to the provided email!");
					window.setTimeout(function(){
						that.flipBack(null, true);
					}, 2000);
				}
				
			});
			
		},
		
		checkSession: function(){
			this.send("checkSession", sessionId);
			if(this.onstart){
				this.onstart();
				this.onstart = null;
			}
			return;
			var sessionId = MT.core.Helper.getCookie(this.sessionCookie);
			if(sessionId){
				this.send("checkSession", sessionId);
				return;
			}
			else{
				if(this.onstart){
					this.onstart();
					this.onstart = null;
				}
			}
		},
		
		a_sessionId: function(id){
			MT.core.Helper.setCookie(this.sessionCookie, id);
			
			if(this.onlogin){
				this.onlogin();
				this.onlogin = null;
			}
		},
		
		a_needLogin: function(msg){
			if(this.isLogged){
				this.project.a_goToHome();
			}
			if(this.onstart){
				this.onstart();
				this.onstart = null;
			}
			else{
				this.showLogin(true);
				if(msg){
					this.setError(msg);
				}
			}
		},
		
		a_loggedIn: function(data){
			var projects = this.projects = data.projects;
			this.userLevel = data.level;
			this.userId = data.userId;
			this.isLogged = true;
			
			if(!this.project.isReady){
				if(this.onstart){
					this.onstart();
					this.onstart = null;
				}
				this.standAlone = false;
				return;
			}
			// first login call
			if(this.onstart){
				this.onstart();
				this.onstart = null;
			}
			
			if(!this.panel){
				return;
			}
			
			
			this.hideLoading();
			this.hideContainer();
			this.panel.title = "My Projects";
			
			if(projects && projects.length > 0){
				var that = this;
				var list = this.project.makeProjectList(projects, function(id, cb){
					that.deleteProject(id, cb);
				});
				
				list.className += " myprojects";
				
				this.panel.content.el.appendChild(list);
				if(!this.project.id){
					this.panel.show();
				}
			}
			
			if(this.userLevel == 0){
				if(this.panel && this.project.id){
					this.showProperties();
				}
				else{
					this.subscribe = this.ui.createPanel("Go Pro");
					this.subscribe.mainTab.addClass("goprotab");
					this.subscribe.mainTab
					this.subscribe.hide();
					this.subscribe.fitIn();
					this.subscribe.removeBorder();
					this.panel.addJoint(this.subscribe);
					this.subscribe.show();
					this.buildGoPro(this.subscribe.content.el);
				}
			}
			this.panel.content.el.appendChild(this.logoutButton.el);
		}
	}
);


var ForgotPassword = function(parent){
	
	
};
ForgotPassword.prototype = {
	
};





























































