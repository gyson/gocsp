#!/usr/bin/env node --harmony

var path = require("path");

var go = require("gocsp");

//var fs = require("fs");

//var loaded = {};

// go.on("load", function (name) {
// 	if (loaded[name]) return;
// 	loaded[name] = true;
	
// 	fs.readFile(name, function (err, file) {
// 		if (err) throw err;
// 		go.define(name, file.toString());
// 	});
// });

go.require(path.join(process.env.PWD, process.argv[2]));
