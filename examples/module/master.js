
var go = require("gocsp");

console.log(__filename);

//console.log(require("child_process"));
go.spawn(__dirname + "/worker.js");


