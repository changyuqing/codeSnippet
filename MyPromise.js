export function MyPromise (executor) {
	const self = this;
	self.state = "pending";// pending, fulfilled 或 rejected.
	self.value = "";
	self.reason = "";

	function reslove(data){
		if(self.state==="pending"){
			self.state="fulfilled";
			self.value = data;

		}
	}
	function reject(data){
		if(self.state==="pending"){
			self.state="rejected";
			self.reason = data;
		}
	}
	try {
		executor(reslove,reject)
	} catch (error) {
		reject(error)
	}
}
MyPromise.prototype.then = function(reslove,reject){
	if(this.state==="fulfilled"){
		reslove(this.value);
	}else if(this.state==="rejected"){
		reject(this.reason);
	}
}
		