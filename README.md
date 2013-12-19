## Communication Sequencial Processes in Javascript

Bring golang-like CSP channel and coroutine to Javascript by using generator (ES6)

It's implemented within 30 loc in Javascript.

## Requirements

Need ES6 generators (nodejs >= 0.11.7)

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
        n = yield* self.take();
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

#### spawn( generator_iterator_object )

Create a new coroutine with generator_iterator_object. The coroutine will end when function calls "return".

```js
function* gen(name) {
	console.log(name, " is inside generator!");

	if (name == "my name") return; // use "return" to quit the generator
}
spawn( gen("my name") ); // create a new coroutine
```
	
#### Channel.send( obj_to_send )

Send an object to the channel. This action will never be blocked.

```js
var chan = new Channel();

chan.send("item to send");
chan.send([1, 2, 3, 4]);
chan.send({ hi: "good" });
```

#### yield* Channel.take()

Block until get an item from the channel.

```js
var chan = new Channel()

spawn(function* () {
	while (true) {
		console.log(yield* chan.take());
	}
}());
```

#### yield* sleep( time_in_millisecond )

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

#### yield* fs.readFile( filename )

Call fs methods async (non-blocking, good performance) with sync style (easier to program).

Not only fs, you can eliminate any callback function with this.

```js
spawn(function* () {

	var f1 = yield* fs.readFile("xxx1.txt", "utf8");
	var f2 = yield* fs.readFile("xxx2.txt", "utf8");

	yield* fs.writeFile("xxx3.txt", "hello");

	yield* fs.appendFile("xxx3.txt", ", world");
	
	var exists = yield* fs.exists("xxx.txt");

}())
```

## Inspiration

* http://github.com/olahol/node-csp
* http://swannodette.github.io/2013/08/24/es6-generators-and-csp
* http://golang.org/
* http://en.wikipedia.org/wiki/Communicating_sequential_processes

## License

MIT
