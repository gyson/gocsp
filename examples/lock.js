var csp = require("../src/csp.js");

var spawn  = csp.spawn
  , send   = csp.send
  , take   = csp.take
  , select = csp.select
  , sleep  = csp.sleep;

/* lock.go try at http://golang.org/#

package main

import "fmt"

func manage(action string, change int, ch, done chan int) {
	for i := 0; i < 10; i++ {
		money := <-ch

		money += change
		fmt.Println("after ", action, " money = ", money)

		ch <- money
	}
	done <- 0
}

func main() {
	ch   := make(chan int, 1)
	done := make(chan int, 2)

	go manage("deposite",  1, ch, done)
	go manage("withdraw", -2, ch, done)

	ch <- 100

	<-done
	<-done
	fmt.Println("** all done **")
}

*/

var chan = "I am the channel for storing money.";

function* manage(action, change) {
	for (var i = 0; i < 10; i++) {
		var money = yield take(chan);

		money += change;
		console.log("after " + action + " money = " + money);

		send(chan, money);	
	};
}

spawn( manage("deposite",  1) );
spawn( manage("withdraw", -2) );

send(chan, 100);

console.log("** all done **");

