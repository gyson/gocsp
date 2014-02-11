## Communication Sequencial Processes in Javascript

Bring golang-like CSP channel and coroutine to Javascript by using generator (ES6)

## Requirements

Need ES6 generators (nodejs >= 0.11.7)

## Install

    $ npm install gocsp

## Run

    $ node --harmony <file>.js

## Difference between csp-js and golang

In csp-js:

* channels have unlimited buffer
* put item to channel will never be blocked

## API

### spawn(Generator or GeneratorFunction)

Create a new coroutine with generator object or generator function. The coroutine will end when function calls "return".

```js
    // spawn with a GeneratorFunction
    spawn(function* () {
        console.log("Hello, world.");
    });
    
    function* hi(name) { console.log("Hello, " + name); }
    // spawn with a generator
    spawn( hi("my name") );
```
    
### Channel.put(object)

Send an object to the channel. This action will never be blocked.

```js
    var chan = new Channel();

    chan.put("item to put");
    chan.put([1, 2, 3, 4]);
    chan.put({ hi: "good" });
```

### yield channel

Block until get an item from the channel.

```js 
    var chan = new Channel()

    // put "hello" to channel
    chan.put("hello")

    spawn(function* () {
        // "hello" will be printed
        console.log(yield chan);
    });
```

### wait(time, channel)

Wait a channel for a mount of time, return an array of two element. First element is the item taken from channel (null or undefined if timeout). Second element is boolean value indicate timeout or not (true for timeout, false for on time).

```js
    spawn(function* () {
        // if with ES6 destructuring assignment, it would like this:
        var [item, timeout] = yield wait(1000, channel);
        
        // you can combine it with other util functions:
        var [files, timeout] = yield wait(1000, parallel(
            fs.readFile("path/to/file1", "utf8")
            fs.readFile("path/to/file2", "utf8")
            fs.readFile("path/to/file2", "utf8")
        ));        
    });
```

### sleep(time)

The current coroutine will sleep for a while (time_in_milliseconds).

```js
    spawn(function* () {
        console.log("Before sleep.");
        
        yield sleep(1000); // sleep for a second
        
        console.log("ok, I am back now");
    });
```

### select([channels array] or { channels map })

Select item from multiple channels

```js
    var chan1 = new Channel();
    var chan2 = new Channel();
    
    chan2.put("I am chan2");
    
    spawn(function* () {
    
        // again, with ES6 destructuring
        var [item, index] = select({
            "channel 1": chan1,
            "channel 2": chan1
        });
        
        // will get item from chan2
        assert(item === "I am chan2");
        assert(index === "channel 2");
        
    });
```

### parallel([chan0, chan1, ...])

Wait results from multiple channels, return an array of items taken from each channels in order.

```js
    var fs = require("gocsp-fs");

    var files = yield parallel([
        fs.readFile("path/to/file0", "utf-8"),
        fs.readFile("path/to/file1", "utf-8"),
        fs.readFile("path/to/file2", "utf-8")        
    ]);
    
    // parallel for an array of channels
    yield parallel.apply(null, [chan0, chan1, chan2])
```

## Inspiration

* http://github.com/olahol/node-csp
* http://swannodette.github.io/2013/08/24/es6-generators-and-csp
* http://golang.org/
* http://en.wikipedia.org/wiki/Communicating_sequential_processes

## License

MIT
