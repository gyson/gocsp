
//var path = require("path");

var go = require("gocsp");

// var fs = require("fs");

// go.on("load", function (name) {

// 	fs.readFile(name, function (err, file) {
// 		if (err) throw err;
// 		go.define(name, file.toString());
// 	});
// });

//go.require(path.join(process.env.PWD, process.argv[process.argv.length-1]));

// get init value
// go.fork("path", {value})
// go.self.prop
// [filename, args]
process.once("message", function (message) {
	var message = JSON.parse(message);
	go.self = new go.Socket(process);
	go.self.main = message[0];
	go.self.args = message[1];
	go.require(go.self.main);
});
