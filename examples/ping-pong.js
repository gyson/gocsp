
var spawn   = require("../lib/csp.js").spawn;
var Channel = require("../lib/csp.js").Channel;

var ping = new Channel();
var pong = new Channel();

function* ping_pong(self, partner, name) {
    do {
        var n = yield self;
        console.log(name, "get", n);
        partner.put(n-1);
    } while (n > 0);
    console.log(name, "done!");
}

spawn( ping_pong(ping, pong, "ping") );
spawn( ping_pong(pong, ping, "pong") );

ping.put(10);

console.log("** all done **");



