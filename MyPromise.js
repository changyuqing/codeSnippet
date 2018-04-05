export function MyPromise(executor) {
	const self = this;
	self.status = "pending"; // pending, fulfilled 或 rejected.
	self.value = "";
	self.reason = "";
	self.fulfilledBus = [];
	self.rejectedBus = [];

	function resolve(data) {
		if (self.status === "pending") {
			self.status = "fulfilled";
			self.value = data;
			self.fulfilledBus.forEach(fn => {
				fn();
			});
		}
	}

	function reject(data) {
		if (self.status === "pending") {
			self.status = "rejected";
			self.reason = data;
			self.rejectedBus.forEach(fn => {
				fn();
			});
		}
	}
	try {
		executor(resolve, reject)
	} catch (error) {
		reject(error)
	}
}
MyPromise.prototype.then = function (onFulfilled, onRejected) {
	const self = this;
	onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function (value) {
		return value;
	};
	onRejected = typeof onRejected === 'function' ? onRejected : function (err) {
		throw err;
	};

	let promise2;
	if (self.status === "fulfilled") {
		promise2 = new MyPromise(function (resolve, reject) {
			setTimeout(function () {
				try {
					let x = onFulfilled(self.value);
					resolvePromise(promise2, x, resolve, reject);
				} catch (error) {
					reject(error);
				}
			});

		})

	}
	if (self.status === "rejected") {
		promise2 = new MyPromise(function (resolve, reject) {
			setTimeout(function () {
				try {
					let x = onRejected(self.reason);
					resolvePromise(promise2, x, resolve, reject);
				} catch (error) {
					reject(error);
				}
			});

		})
	}

	if (self.status === "pending") {
		promise2 = new MyPromise(function (resolve, reject) {
			self.fulfilledBus.push(function () {
				setTimeout(function () {
					try {
						let x = onFulfilled(self.value)
						resolvePromise(promise2, x, resolve, reject);
					} catch (error) {
						reject(error);
					}
				});

			});
			self.rejectedBus.push(function () {
				setTimeout(function () {
					try {
						let x = onRejected(self.reason)
						resolvePromise(promise2, x, resolve, reject)
					} catch (error) {
						reject(error);
					}
				});

			});
		})
	}
	return promise2;
}

MyPromise.prototype.catch = function(onRejected){
	return this.then(null,onRejected);
}

MyPromise.all = function(promises){
	let length = promises.length;
	let num = 0;
	let result=[];
	return new MyPromise(function(resolve,reject){
		promises.forEach((promise)=>{
			
			promise.then(function(data){
				num++;
				result.push(data);
				if(num===length){
					resolve(result);
				}
			},function(err){
				reject(err);
			})
		})
	});
	
}
MyPromise.race = function(promises){
	return new MyPromise(function(resolve,reject){
		promises.forEach((promise)=>{	
			promise.then(function(data){
					resolve(data);
			},function(err){
				reject(err);
			})
		})
	});
	
}
MyPromise.reject = function(reason){
	return new MyPromise(function(resolve,reject){
		reject(reason);
	})
}
MyPromise.resolve = function(value){
	return new MyPromise(function(resolve,reject){
		resolve(value);
	})
}
function resolvePromise(promise, x, resolve, reject) {
	if(x===undefined){
		resolve(x);
	}
	if (promise === x) {
		return reject("TypeError")
	}
	let called = false;
	if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
		try {
			let then = x.then;
			if (typeof then === 'function') {
				then.call(x, function (y) {
					if (called) return;
					called = true;
					resolvePromise(promise, y, resolve, reject);
				}, function (r) {
					if (called) return;
					called = true;
					reject(r)
				});
			} else {
				resolve(x);
			}
		} catch (error) {
			if (called) return;
			called = true;
			reject(error);
		}


	} else {
		resolve(x);
	}

}
