## Communication Sequencial Processes in Javascript

Bring golang-like CSP channel and coroutine to Javascript by using generator (ES6)

## Requirements

Need ES6 (nodejs >= 0.11.13)

## Install

    $ npm install gocsp

## Run

    $ node --harmony <file>.js

## Example

```js
var fs = require('fs')
var go = require('gocsp')

var chan1 = new go.Channel()
var chan2 = new go.Channel()

go(function* () {
    // sleep for 1 second
    yield cb => setTimeout(cb, 1000)

    // read file
    var file = yield cb => fs.readFile(__filename, 'utf8', cb)

    // check if file exaists
    yield cb => fs.exists('path', x => cb(null, x))
    yield cb => fs.exists('path', cb.bind(null, null))

    // take an item from Channel
    yield go.take(chan1)

    // put an item to Channel
    yield go.put(chan2, 'something')

    // select from multiple channel / events
    // just like golang's select statement
    yield go.select(s => s
        .take(chan1, function (val) {
            // ...
        })
        .put(chan2, 'value', function (result) {
            // ...
        })
        .timeout(1000)
    )

    // TODO: channel / stream API
    var fs = require('gocsp-fs')
    yield go.link(
        fs.openRead('path'),
        fs.openWrite('path')
    )
})()
```

## Resource

* https://github.com/Gozala/channel
* https://github.com/visionmedia/co
* https://github.com/olahol/node-csp
* http://swannodette.github.io/2013/08/24/es6-generators-and-csp
* http://golang.org/
* http://en.wikipedia.org/wiki/Communicating_sequential_processes

## License

MIT
