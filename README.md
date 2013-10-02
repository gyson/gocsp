## Communication Sequencial Processes in Javascript

Bring golang-like CSP channel and coroutine to Javascript by using generator (ES6)

## Requirements

Need ES6 generators (nodejs >= 0.11.2)

## Run

	$ node -harmony <file>.js

## Difference between csp-js and golang

In csp-js:

* you don't need to create channel
* channels are identified by number or string
* channels have unlimited buffer
* send item to channel will never be blocked 

## Example

```js
// ping_pong example

// get csp.js source file
var csp = require("./src/csp.js");

function* ping_pong(self, partner) {
	var n = 1;
	while (n > 0) {
		n = yield csp.take(self);
		
		console.log(self, "get", n);
		
		csp.send(partner, n - 1);
	}
	console.log(self, "done!!!");
}

function* main() {
	spawn( ping_pong("ping", "pong") );
	spawn( ping_pong("pong", "ping") );

	csp.send("ping", 6);
}

csp.spawn( main() );

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

#### spawn( generator_iterator_object )

Create a new coroutine with generator_iterator_object. The coroutine will be destroyed when function calls "return".

```js
function* gen(name) {
	console.log(name, " is inside generator!");

	if (name == "Orz") return; // quit
}
csp.spawn( gen("Orz") ); // create a new coroutine
```
	
#### send( channel, item_to_send )

Send an item to the channel. This action will never be blocked.

```js
// channel is identified by string or number
var chan = "I am a channel";

csp.send(chan, "item to send");
```

#### yield take( channel )

Block until get an item from the channel.

```js
csp.spawn(function* () {
	while (true) {
		console.log(yield csp.take("channel"));
	}
}());
```

#### yield take( channel, max_time_to_wait )

Wait to get an item from channel. If the coroutine cannot get item after max_time_to_wait, it will get a "null" instead.

```js
csp.spawn(function* () {
	while (true) {
		console.log(yield csp.take("channel", 1000));
	}
}());
```

#### yield select( list_of_channels )

Block until a value is sent to one of channels in list_of_channels.

```js
csp.spawn(function* () {
	while (true) {
		console.log(yield csp.select([0, 1, "channel_2"]);
	}
}());
```
#### yield select( list_of_channels, max_time_to_wait )

Block until a value is sent to one of channels in list_of_channels. If the coroutine cannot get item after max_time_to_wait, it will get a "null" instead.

```js
csp.spawn(function* () {
	while (true) {
		console.log(yield csp.select([0, 1, "channel_2"], 1000);
	}
}());
```

#### yield sleep( time_in_millisecond )

The coroutine will sleep for a while (time_in_milliseconds).

```js
function* i_am_lazy() {
	while (true) {
		yield csp.sleep(1000);
		console.log("ok");
	}
}
csp.spawn( i_am_lazy() );
```

## Inspiration

* http://github.com/olahol/node-csp
* http://swannodette.github.io/2013/08/24/es6-generators-and-csp
* http://golang.org/
* http://en.wikipedia.org/wiki/Communicating_sequential_processes

## License

MIT
