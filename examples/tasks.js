var csp = require("../src/csp.js");

var spawn  = csp.spawn
  , send   = csp.send
  , take   = csp.take
  , select = csp.select
  , sleep  = csp.sleep;

function task(input) {
	return input * input;
}

var result_channel = "I am the channel for result of task";

function* worker(listen) {
	var input = yield take(listen);
	send(result_channel, task(input));
}

function* main() {
	for (var i = 1; i <= 20; i++) {
		spawn( worker(i) );
		send(i, i);
	}
	
	for (var i = 1; i <= 20; i++) {
		console.log("get: ", yield take(result_channel));
	}
}

spawn(main());

