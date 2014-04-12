## Communication Sequencial Processes in Javascript

Bring golang-like CSP channel and coroutine to Javascript by using generator (ES6)

## Requirements

Need ES6 generators (nodejs >= 0.11.11)

## Install

    $ npm install gocsp

## Run

    $ node --harmony <file>.js

## API

### go(Generator or GeneratorFunction)

Create a new coroutine with generator object or generator function. The coroutine will end when function calls "return".

    // spawn with a GeneratorFunction
    go(function* () {
        console.log("Hello, world.");
    });
    
    function* hi(name) { console.log("Hello, " + name); }
    // spawn with a generator
    go( hi("my name") );
    
### go.Channel

    var chan = new go.Channel();

    go(function* () {
        console.log(yield chan); // print "xxx"
        console.log(yield chan); // print "yyy"
    });

    chan.put("xxx");
    chan.put("yyy");

### go.yield

used to take an item from a channel wihout generator

```js
    var addr = "http://rawgithub/gyson/master/build/gocsp.js";
    go.yield(go.request(addr), function (err, res) {
        if (err) throw err;
        console.log(res);
    });
```

### go.require / go.load

built-in module system

### go.request

http request

    var addr = "http://rawgithub/gyson/master/build/gocsp.js";
    go(function* () {
        var result = yield go.request(addr);
        console.log(result.statusCode);
    });

### go.sleep(time)

The current coroutine will sleep for a while (time_in_milliseconds).

    go(function* () {
        console.log("Before sleep.");
        
        yield go.sleep(1000); // sleep for a second
        
        console.log("ok, I am back now");
    });

## Inspiration

* http://github.com/olahol/node-csp
* http://swannodette.github.io/2013/08/24/es6-generators-and-csp
* http://golang.org/
* http://en.wikipedia.org/wiki/Communicating_sequential_processes

## License

MIT
