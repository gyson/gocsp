
var go = require("..");
var ping = new go.Channel();
var pong = new go.Channel();

var ping_pong = go.async(function* ping_pong (self, partner, name) {
    do {
        var n = (yield go('take', self)).value;

        console.log(name, "get", n);

        partner.put(n-1);

    } while (n > 1);

    console.log(name, "done!");
})

ping_pong(ping, pong, "ping")
ping_pong(pong, ping, "pong")

ping.put(10);
