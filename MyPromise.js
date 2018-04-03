export function MyPromise (executor) {
	const self = this;
	self.state = "pending";// pending, fulfilled 或 rejected.
	self.value = "";
	self.reason = "";
	self.fulfilledBus=[];
	self.rejectedBus=[];
	function reslove(data){
		if(self.state==="pending"){
			self.state="fulfilled";
			self.value = data;
			self.fulfilledBus.forEach(fn => {
				fn(self.value);
			});
		}
	}
	function reject(data){
		if(self.state==="pending"){
			self.state="rejected";
			self.reason = data;
			self.rejectedBus.forEach(fn => {
				fn(self.reason);
			});
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

	if(this.state==="pending"){
		this.fulfilledBus.push((value)=>{reslove(value)});
		this.rejectedBus.push((reason)=>{reject(reason)});
	}
}
		