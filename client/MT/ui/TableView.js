MT.require("ui.InputHelper");

MT.extend("ui.DomElement").extend("core.Emitter")(
	MT.ui.TableView = function(data, header){
		MT.ui.DomElement.call(this);
		
		this.table = document.createElement("table");
		this.el.appendChild(this.table);
		
		var tr, td, tmp;
		
		this.header = header;
		if(data){
			this.setData(data, header);
		}
		
		
		var that = this;
		
		this.input = new MT.ui.InputHelper();
		
		this.input.on("change", function(value){
			that.input.el.innerHTML = value;
			
		});
		
		this.input.on("blur", function(){
			that.updateData(that.input.el);
		});
		
		this.input.on("tab", function(e){
			var el = that.input.el;
			that.input.blur();
			that.jumpToNext(el, e.shiftKey);
		});
		
		this.input.on("enter", function(e){
			var el = that.input.el;
			that.input.blur();
			that.jumpToNext(el, e.shiftKey);
		});
		
		this.table.onclick = function(e){
			e.preventDefault();
			e.stopPropagation();
			if(!e.target.data){
				return;
			}
			that.input.show(e.target);
		};
		
	},
	{
		size: 0,
		isKeyValue: false,
		
		toKeyValue: function(){
			
		},
		
		setData: function(data, header){
			
			this.table.innerHTML = "";
			this._created = false;
			this._allowEmpty = true;
			
			
			this.origData = data;
			
			this.data = _.cloneDeep(data);
			this.header = this.header || header;
			
			
			if(!Array.isArray(this.data)){
				this.isKeyValue = true;
				
				tmp = this.data;
				this.data = [];
				for(var k in tmp){
					this.data.push([k, tmp[k]]);
				}
			}
			
			this.createTable();
			
		},
		
		jumpToNext: function(el, reverse){
			if(!reverse){
				if(el.nextSibling){
					this.input.show(el.nextSibling);
				}
				else if(el.parentNode.nextSibling){
					this.input.show(el.parentNode.nextSibling.firstChild);
				}
			}
			else{
				if(el.previousSibling){
					this.input.show(el.previousSibling);
				}
				else if(el.parentNode.previousSibling){
					// check header
					if(el.parentNode.previousSibling.lastChild.data){
						this.input.show(el.parentNode.previousSibling.lastChild);
					}
				}
			}
		},
		updateData: function(el){
			var row = el.data.row;
			var cell = el.data.index;
			var val = el.innerHTML;
			
			// is new value added ?
			if(row == -1){
				// ignore values without keys
				if(this.isKeyValue && (cell > 0 || val == "")){
					this.createTable();
					return;
				}
				
				var nn = [];
				var tmp = "";
				for(var i=0; i<this.size; i++){
					if(i == cell){
						nn.push(val);
					}
					else{
						nn.push(tmp);
					}
				}
				
				row = this.data.length;
				this.data.push(nn);
				this.allowEmpty = true;
			}
			
			// bug?
			if(!this.data[row]){
				return;
			}
			this.data[row][cell] = val;
			
			if(this.isKeyValue){
				// was key deleted?
				if(val == "" && cell == 0){
					this.data.splice(row, 1);
					if(this.header){
						this.table.removeChild(this.table.children[row+1]);
					}
					else{
						this.table.removeChild(this.table.children[row]);
					}
				}
				
				
				// recreate all object - because indexes will mess up
				for(var key in this.origData){
					delete this.origData[key];
				}
				
				
				for(var i=0; i<this.data.length; i++){
					this.origData[this.data[i][0]] = this.data[i][1];
				}
				
				
			}
			else{
				this.origData.length = 0;
				for(var i=0; i<this.data.length; i++){
					this.origData[i] = [];
					for(var j=0; j<this.data[i].length; j++){
						this.origData[j] = this.data[i][j];
					}
				}
			}
			
			this.createTable();
			this.emit("change", this.origData);
		},
		
		_allowEmpty: true,
		set allowEmpty(val){
			this._allowEmpty = val;
		},
		get allowEmpty(){
			return this._allowEmpty;
		},
		_created: false,
		createTable: function(){
			var tr, td, tmp;
			var i, j;
			var nextTr = this.table.firstChild;
			
			if(this.header){
				j = this.header.length;
				if(!this._created){
					tr = document.createElement("tr");
					this.table.appendChild(tr);
				}
				else{
					tr = nextTr;
					nextTr = tr.nextSibling;
				}
				for(var i=0; i<this.header.length; i++){
					td = tr.children[i] || document.createElement("th");
					td.innerHTML = this.header[i];
					if(!td.parentNode){
						tr.appendChild(td);
					}
				}
			}
		
			for(i=0; i<this.data.length; i++){
				if(!this._created){
					tr = document.createElement("tr");
					this.table.appendChild(tr);
				}
				else{
					tr = nextTr;
					nextTr = tr.nextSibling;
				}
				
				//internaly we will use array for objects also: 0 - key, 1 - value
				if(!Array.isArray(this.data[i]) ){
					this.isKeyValue = true;
					
					tmp = this.data[i];
					this.data[i] = [];
					for(var k in tmp){
						this.data[i].push(k);
						this.data[i].push(i);
					}
				}
				
				tmp = this.data[i];
				for(j=0; j<tmp.length; j++){
					this.addCell(tr, i, j, tmp[j]);
				}
				
			}
			
			this.size = j;
			
			if(this.allowEmpty){
				tr = document.createElement("tr");
				this.table.appendChild(tr);
				
				tmp = this.data[i];
				for(var l=0; l<j; l++){
					this.addCell(tr, -1, l, "");
				}
			}
			this.allowEmpty = false;
			this._created = true;
			
		},
		addCell: function(row, rowNum, cellIndex, text){
			var cell = row.children[cellIndex] || document.createElement("td");
			if(!cell.parentNode){
				row.appendChild(cell);
			}
			cell.data = {
				row: rowNum,
				index: cellIndex
			};
			cell.innerHTML = text;
			cell.setAttribute("width", 100);
			return cell;
		}

	}
);