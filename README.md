## Communication Sequencial Processes in Javascript

Bring golang-like CSP channel and coroutine to Javascript by using generator (ES6)

## Requirements

Need ES6 generators (nodejs >= 0.11.7)

## Install

	$ npm install rejs-csp

## Run

	$ node -harmony <file>.js

## Difference between csp-js and golang

In csp-js:

* channels have unlimited buffer
* send item to channel will never be blocked 

## Example

```js
var ping = new Channel();
var pong = new Channel();

function* ping_pong(self, partner, name) {
    var n = 1;
    while(n > 0) {
        n = yield self;
        console.log(name, "get", n);
        partner.send(n-1);
    }
    console.log(name, "done!");
}

spawn(ping_pong(ping, pong, "ping"))
spawn(ping_pong(pong, ping, "pong"))

ping.send(6)

console.log("** all done! **");
```

	$ node -harmony ping-pong.js
	ping get 6
	pong get 5
	ping get 4
	pong get 3
	ping get 2
	pong get 1
	ping get 0
	pong get -1
	pong done!!!
	ping done!!!
	** all done **

## Documentation

#### spawn(generator)

Create a new coroutine with generator object. The coroutine will end when function calls "return".

```js
function* gen(name) {
	console.log(name, " is inside generator!");

	if (name == "my name") return; // use "return" to quit the generator
}
spawn( gen("my name") ); // create a new coroutine
```
	
#### Channel.send( object )

Send an object to the channel. This action will never be blocked.

```js
var chan = new Channel();

chan.send("item to send");
chan.send([1, 2, 3, 4]);
chan.send({ hi: "good" });
```

#### yield channel

Block until get an item from the channel.

```js
var chan = new Channel()

spawn(function* () {
	while (true) {
		console.log(yield chan);
	}
}());
```

#### yield* sleep(time)

The coroutine will sleep for a while (time_in_milliseconds).

```js
function* i_am_lazy() {
	while (true) {
		yield* sleep(1000);
		console.log("ok");
	}
}
spawn( i_am_lazy() );
```

#### yield* wait(time, generator)

```js

	var result = yield* wait(1000, sleep(2000));

	assert(result.timeout === true);
```

#### yield* parallel(generators)

```js
	var fs = require("rejs-fs");

	var files = yield* parallel([
		fs.readFile("path/to/file", "utf-8"),
		fs.readFile("path/to/file", "utf-8"),
		fs.readFile("path/to/file", "utf-8"),		
	]);
```

## Inspiration

* http://github.com/olahol/node-csp
* http://swannodette.github.io/2013/08/24/es6-generators-and-csp
* http://golang.org/
* http://en.wikipedia.org/wiki/Communicating_sequential_processes

## License

MIT
