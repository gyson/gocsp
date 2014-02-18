
var go = require("../lib/gocsp.js");

var ping = new go.Channel();
var pong = new go.Channel();

function* ping_pong (self, partner, name) {
    do {
        var n = yield self;
        console.log(name, "get", n);
        partner.put(n-1);
    } while (n > 0);
    console.log(name, "done!");
}

go( ping_pong(ping, pong, "ping") );
go( ping_pong(pong, ping, "pong") );

ping.put(10);

console.log("** all done **");

