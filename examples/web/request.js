
var go = require('gocsp');


go(function* () {

	console.log(yield go.request("http://rawgithub.com/joyent/node/master/lib/child_process.js"));

});



