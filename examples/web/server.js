
var WebSocketServer = require("ws").Server;

var wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function (ws) {
	
	ws.on("message", function (message) {

		console.log("ws received: ", message);

	});

	ws.on("close", function (event) {
		console.log("ws is closed: ", event);
	})

	ws.on("error", function (event) {
		console.log("ws has error: ", event);
	})

	ws.send("Connected!");

});

