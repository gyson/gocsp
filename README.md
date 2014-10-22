## Communication Sequencial Processes in Javascript

Bring golang-like CSP channel and coroutine to Javascript by using generator (ES6)

## Install

    $ npm install gocsp

## Run

    $ node --harmony <file>.js

## Example

```js
import { readFile, exists } from 'fs'
import { co, take, put, select, link } from 'gocsp'

var chan1 = new go.Channel()
var chan2 = new go.Channel()

co(function* () {
    // sleep for 1 second
    yield cb => setTimeout(cb, 1000)

    // read file
    var file = yield cb => readFile(__filename, 'utf8', cb)

    // check if file exaists
    yield cb => exists('path', x => cb(null, x))
    yield cb => exists('path', cb.bind(null, null))

    // take an item from Channel
    yield take(chan1)

    // put an item to Channel
    yield put(chan2, 'something')

    // select from multiple channel / events
    // just like golang's select statement
    yield select(s => s
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
    yield link(
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
