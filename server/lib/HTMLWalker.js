var HTMLWalker = function(strIn, events){
	var str = this.str = strIn;

	if(events){
		this.events = events;
	}
	this.next = this.checkTags;

	for(var i=0, l=str.length; i < l; i++){
		this.next(str[i], i);
	}

	if(this.buffer != ""){
		if(this.events.ontext){
			this.events.ontext(this.buffer);
		}
		this.buffer = "";
	}
};

HTMLWalker.prototype = {
	next: null,

	activeTag: "",
	activeAttribute: "",
	buffer: "",
	quote: "",
	lastQuote: "",

	events: {
		ontagopen: function(tag){
			console.log("OPEN: [" + tag + "]");
		},
		ontagleave: function(tag){
			console.log("LEAVE: [" + tag + "]");
		},
		ontagclose: function(tag, auto){
			console.log("CLOSE: ["+ tag + "]; auto:", auto);
		},
		ontext: function(tag, auto){
			console.log("TEXT: ["+tag+"]");
		},
		onattribute: function(name, value){
			console.log("ATTR: [" + name + "] => ["+value+"]");
		},
		oncomment: function(comment){
			console.log("COMMENT: [" + comment + "]");
		},
		oncdata: function(cdata){

		}
	},
	checkTags: function(char, index){
		if(this.isStartTag(char)){
			if(this.buffer != ""){
				if(this.events.ontext){
					this.events.ontext(this.buffer);
				}
			}
			this.buffer = char;

			this.next = this.startOrEnd;
			return;
		}
		this.buffer += char;
	},

	startOrEnd: function(char, index){
		if(this.isWhitespace(char)){
			if(this.events.ontext){
				this.events.ontext(this.buffer);
			}

			this.buffer = "";

			this.next = this.checkTags;
			return;
		}

		if(!this.isSlash(char)){
			this.enterTag(char);
		}
		else{
			this.getTagStartName(char, index);
			this.leaveTag();
		}
	},

	enterTag: function(char){
		this.buffer = char;
		this.next = this.getTagStartName;
	},
	leaveTag: function(){
		this.buffer = "";
		this.next = this.getTagEndName;
	},

	getTagStartName: function(char){
		if(this.isComment(this.buffer)){
			this.next = this.lookForCommentEnd;
			this.buffer = char;
			return;
		}
		if(this.isCDATA(this.buffer)){
			this.next = this.lookForCDATAEnd;
			this.buffer = char;
			return;
		}

		if(this.isEndTag(char)){
			if(this.events.ontagopen){
				this.events.ontagopen(this.buffer);
			}
			if(this.events.ontagleave){
				this.events.ontagleave(this.buffer);
			}
			this.buffer = "";
			this.next = this.checkTags;
			return;
		}

		if(this.isWhitespace(char) ){
			if(this.events.ontagopen){
				this.events.ontagopen(this.buffer);
			}
			this.activeTag = this.buffer;
			this.buffer = "";
			this.next = this.checkArgs;
		}
		else{
			this.buffer += char;
		}
	},

	lookForCDATAEnd: function(char){
		this.buffer += char;

		var len = this.buffer.length - 3;
		var end = this.buffer.substring(len);
		if(this.isCDATAEnd(end)){
			if(this.events.oncdata){
				this.events.oncdata(this.buffer.substring(0, len));
			}
			this.buffer = "";
			this.next = this.checkTags;
		}
	},

	lookForCommentEnd: function(char){
		this.buffer += char;

		var len = this.buffer.length - 3;
		var end = this.buffer.substring(len);
		if(this.isCommentEnd(end)){
			if(this.events.oncomment){
				this.events.oncomment(this.buffer.substring(0, len));
			}
			this.buffer = "";
			this.next = this.checkTags;
		}
	},
	getTagEndName: function(char){
		if(this.isWhitespace(char) || this.isEndTag(char)) {
			if(this.events.ontagclose){
				this.events.ontagclose(this.buffer, false);
			}
			this.buffer = "";
			this.next = this.checkTags;
		}
		else{
			this.buffer += char;
		}
	},

	checkArgs: function(char, index){
		if(this.isEndTag(char)){
			if(this.events.onattribute){
				this.events.onattribute(this.buffer, "", "");
			}
			if(this.events.ontagleave){
				this.events.ontagleave(this.activeTag);
			}

			this.buffer = "";
			this.next = this.checkTags;
			return;
		}
		if(this.willClose(char, index)){
			this.next = this.closeTag;
			return;
		}

		if(this.isWhitespace(char)){
			this.activeAttribute = this.buffer;
			this.buffer = "";
			this.next = this.expectEqual;
			return;
		}
		if(this.isEqual(char)){
			this.activeAttribute = this.buffer;
			this.buffer = "";
			this.lastQuote = "";
			this.next = this.checkArgValue;
			return;
		}

		this.buffer += char;
	},
	expectEqual: function(char, index){
		if(this.isWhitespace(char)){
			return;
		}
		if(this.willClose(char, index)){
			if(this.events.onattribute){
				this.events.onattribute(this.activeAttribute, this.buffer, this.lastQuote);
			}
			this.next = this.closeTag;
			return;
		}
		if(this.isEqual(char)){
			this.lastQuote = "";
			this.next = this.checkArgValue;
		}
	},

	checkArgValue: function(char, index){
		if(this.buffer == "" && this.isWhitespace(char)){
			return;
		}
		if(this.isInsideQuote(char)){
			if(!this.isQuote(char)){
				this.buffer += char;
			}
			else{
				this.lastQuote = this.quote;
			}
			return;
		}

		if(this.isWhitespace(char)){
			if(this.events.onattribute){
				this.events.onattribute(this.activeAttribute, this.buffer, this.lastQuote);
			}
			this.buffer = "";
			this.next = this.checkArgs;
			return;
		}

		if(this.isEndTag(char)){
			if(this.events.onattribute){
				this.events.onattribute(this.activeAttribute, this.buffer, this.lastQuote);
			}
			if(this.events.ontagleave){
				this.events.ontagleave(this.activeTag);
			}
			this.buffer = "";
			this.next = this.checkTags;
			return;
		}

		if(this.willClose(char, index)){
			if(this.events.onattribute){
				this.events.onattribute(this.activeAttribute, this.buffer, this.lastQuote);
			}
			this.buffer = "";
			this.next = this.closeTag;
			return;
		}

		if(!this.isQuote(char)) {
			this.buffer += char;
		}
	},

	closeTag: function(char){

		if(this.events.ontagclose){
			this.events.ontagclose(this.activeTag, true);
		}
		this.buffer = "";
		this.activeTag = "";

		this.next = this.checkTags;
	},

	isCDATA: function(str){
		return str === "![CDATA[";
	},

	isCDATAEnd: function(str){
		return str === "]]>"
	},
	isComment: function(str){
		return str === "!--";
	},

	isCommentEnd: function(str){
		return str.substring(str.length - 3) === "-->";
	},

	isInsideQuote: function(char){
		if(this.quote == char){
			this.quote = "";
			return false;
		}

		if(!!this.quote){
			return true;
		}

		if(this.isQuote(char)){
			this.quote = char;
			return true;
		}

		return false;
	},
	isQuote: function(char){
		switch(char){
			case "'":
			case '"':
				return true;
		}
		return false;
	},

	isWhitespace: function(char){
		switch(char){
			case " ":
			case "\t":
			case "\r":
			case "\n":
				return true;
		}
		return false;
	},
	isSlash: function(char){
		return char === "/";
	},
	isStartTag: function(char){
		return char === "<";
	},
	isEndTag: function(char){
		return char === ">";
	},
	isEqual: function(char){
		return char === "=";
	},

	willClose: function(char, index){
		return char == "/" && this.str[index+1] == ">";
	}
};

this.HTMLWalker = HTMLWalker;
