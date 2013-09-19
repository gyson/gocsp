var csp = require("../src/csp.js");

var spawn  = csp.spawn
  ,	send   = csp.send
  , take   = csp.take
  , select = csp.select
  , sleep  = csp.sleep;

function* worker(address, response) {
	while (true) {
		var request = yield take(address);
	
	}
}

spawn( worker("/", "I am homepage.") );
spawn( worker("/hello", "hello, world!"));

// start server...

// send to "/" or "/hello"