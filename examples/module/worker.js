
console.log("I am a worker");


console.log(require("./xxx.js"));

go.yield($require("./yyy.js"), function (err, result) {
	console.log(result);
});
