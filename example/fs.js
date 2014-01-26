
var fs = require("rejs-fs");

var spawn = require("rejs-csp").spawn;

spawn(function*() {

	var result = yield* fs.writeJSON(__dirname + "/fs.json", {
		name: "fs.json",
		path: __dirname
	});

	console.log(result);
})

