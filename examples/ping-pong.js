
// let { spawn, Channel } = require("../src/csp.js");

var csp = require("../src/csp.js");

var spawn = csp.spawn;
var Channel = csp.Channel;

var ping = new Channel();
var pong = new Channel();

function* ping_pong(self, partner, name) {
    do {
        n = yield* self.take();
        console.log(name, "get", n);
        partner.send(n-1);
    } while (n > 0);
    console.log(name, "done!");
}

spawn(ping_pong(ping, pong, "ping"))
spawn(ping_pong(pong, ping, "pong"))

ping.send(20)

console.log("** all done **");
