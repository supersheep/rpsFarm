

function List(constructor,max){
	
	this.max = max; 
	this.constructor = constructor;	
	this._list = [];
	
}



List.prototype = {
	_getName:function(obj){
		if(typeof obj === "object"){
			return obj && obj.name ? obj.name : null;
		}else if(typeof obj == "string"){
			return obj;
		}else{
			return null;
		}
	},
	count:function(){
		return this._list.length;
	},
	add:function(obj){
		if(obj.constructor !== this.constructor){
			throw "Constructor not match: expect " + this.constructor + ", given " + obj.constructor
		}else if(this._list.length == this.max){
			throw "full";
		}else if(this.has(obj)){
			throw "exists";
		}else{
			this._list.push(obj);
		}
	},
	indexOf:function(obj){
		var name = this._getName(obj);
		var list = this.all();
		for(var i = 0 ; i < list.length ; i++){
			if(list[i].name == name){return i};
		}
		return -1;
	},
	has:function(obj){
		var index = this.indexOf(obj);
		
		return index != -1;
	},
	remove:function(obj){
		var index = this.indexOf(obj);
		this._list.slice(index,1);
	},
	all:function(){
		return this._list;
	},
	get:function(name){
		var index = this.indexOf(name);
		return this._list[index];
	}
	
}

exports.List = List;