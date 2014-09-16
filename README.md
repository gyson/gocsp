## Communication Sequencial Processes in Javascript

Bring golang-like CSP channel and coroutine to Javascript by using generator (ES6)

## Requirements

Need ES6 generators (nodejs >= 0.11.13)

## Install

    $ npm install gocsp

## Run

    $ node --harmony <file>.js

## API

### go(Generator or GeneratorFunction)

Create a new coroutine with generator object or generator function. The coroutine will end when function calls "return".

```js
// spawn with a GeneratorFunction
go(function* () {
    console.log("Hello, world.");
})();

var hi = go(function* hi(name) { console.log("Hello, " + name); })
// spawn with a generator
hi("my name");
```

### go.Channel

```js
var chan = new go.Channel();

go(function* () {
    console.log(yield chan); // print "xxx"
    console.log(yield chan); // print "yyy"
});

chan.put("xxx");
chan.put("yyy");
```

### go.sleep(time)

The current coroutine will sleep for a while (time_in_milliseconds).

```js
go(function* () {
    console.log("Before sleep.");

    yield go.sleep(1000); // sleep for a second

    console.log("ok, I am back now");
})();
```

## Inspiration

* https://github.com/Gozala/channel
* https://github.com/visionmedia/co
* https://github.com/olahol/node-csp
* http://swannodette.github.io/2013/08/24/es6-generators-and-csp
* http://golang.org/
* http://en.wikipedia.org/wiki/Communicating_sequential_processes

## License

MIT
