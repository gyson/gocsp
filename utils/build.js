
var fs = require("gocsp-fs");
var UglifyJS = require("uglify-js");

go(function* () {
	
	// read file from 
	var src = (yield fs.readFile(__dirname + "/../lib/go.js"))
	        + (yield fs.readFile(__dirname + "/../lib/util.js"))
	        + (yield fs.readFile(__dirname + "/../lib/module.js"))
	        + (yield fs.readFile(__dirname + "/../lib/web.js"));

	// write regular one
	fs.writeFile(__dirname + "/../build/gocsp.js", src);

	// write min one
	var min = UglifyJS.minify(src, { fromString: true });
	fs.writeFile(__dirname + "/../build/gocsp.min.js", min.code);
});

