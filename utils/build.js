
var fs = require("fs");
var UglifyJS = require("uglify-js");

// read file from 
var src = fs.readFileSync(__dirname + "/../lib/go.js",     "utf8")
        + fs.readFileSync(__dirname + "/../lib/util.js",   "utf8")
        + fs.readFileSync(__dirname + "/../lib/module.js", "utf8")
        + fs.readFileSync(__dirname + "/../lib/web.js",    "utf8");

// write regular one
fs.writeFile(__dirname + "/../build/gocsp.js", src);

// write min one
var min = UglifyJS.minify(src, { fromString: true });
fs.writeFile(__dirname + "/../build/gocsp.min.js", min.code);

