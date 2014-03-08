
var WebSocket = require("ws");

// var socket = new WebSocket("ws://localhost:8081");

// //socket.send("ookkk");

// socket.onopen = function () {
// 	console.log("socket is opened: ", arguments);
// }

// socket.onmessage = function (message) {
// 	console.log("received: ", message);
// }

// socket.onerror = function (event) {
// 	console.log("error: ", event);

// 	console.log("ws is: ", socket);
// 	// connection error
// 	// send error to ret channel, and close
// 	// socket.message.close()

// }

// socket.onclose = function (event) {
// 	console.log("close: ", event);
// 	// close all send event
// 	// socket.message.close()
// }

var go = require("gocsp");

go(function* () {
	var socket = yield go.connect("ws://localhost:8080");

	socket.send("Hi from go.connect!");

	console.log(yield socket.message);

	socket.close();

	socket.send("okkkk");

	console.log((yield socket.message));

})


