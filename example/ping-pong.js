
var go = require('gocsp');
var ping = new go.Port();
var pong = new go.Port();

var ping_pong = go(function* ping_pong (self, partner, name) {
    do {
        var n = (yield go.take(self)).value

        console.log(name, "get", n)

        partner.put(n-1)

    } while (n > 1)

    console.log(name, "done!");
})

ping_pong(ping, pong, "ping")
ping_pong(pong, ping, "pong")

ping.put(10);
