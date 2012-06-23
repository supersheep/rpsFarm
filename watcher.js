
function Watcher(name,id){
	this.name = name;
	this.socket = id;
	console.log("init watcher",name);
}

exports.Watcher = Watcher;
