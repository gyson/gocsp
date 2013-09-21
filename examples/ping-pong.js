var csp = require("../src/csp.js");

var spawn  = csp.spawn
  , send   = csp.send
  , take   = csp.take
  , select = csp.select
  , sleep  = csp.sleep;

/* ping_pong.go try at http://golang.org/#

package main

import "fmt"

func ping_pong(name string, self, partner, done chan int) {
	for n := 1; n > 0; {
		n = <-self
		fmt.Println(name, " get ", n)
		partner <- (n - 1)
	}
	fmt.Println(name, " done!!!")
	done <- 0
}

func main() {
	ping := make(chan int, 1)
	pong := make(chan int, 1)

	// done channel is used for waiting result
	// from go-routine
	done := make(chan int, 2)

	go ping_pong("ping", ping, pong, done)
	go ping_pong("pong", pong, ping, done)

	ping <- 10
	<-done
	<-done
}

*/

function* ping_pong(self, partner) {
	var n = 1;
	while (n > 0) {
		n = yield take(self);
		console.log(self, "get", n);
		send(partner, n - 1);
	}
	console.log(self, "done!!!");
}

function* main() {
	spawn( ping_pong("ping", "pong") );
	spawn( ping_pong("pong", "ping") );

	send("ping", 6);
}

spawn( main() );

console.log("** all done **");


