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

go(function* () {

    // sleep for 1 second
    yield (res, rej) => setTimeout(res, 1000)

    // read file
    var file = yield cb => fs.readFile(__filename, 'utf8', cb)

    console.log(file)

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
