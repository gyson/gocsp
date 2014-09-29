## Communication Sequencial Processes in Javascript

Bring golang-like CSP channel and coroutine to Javascript by using generator (ES6)

## Requirements

Need ES6 generators + native Promise (nodejs >= 0.11.13)

## Install

    $ npm install gocsp

## Run

    $ node --harmony <file>.js

## Example

```js
var go = require('gocsp');

var chan = new go.Channel()

chan.put('hi')

go.spawn(function* () {
    assert((yield go('take', chan)).value === 'hi')
})
```

## Error Handling && Stack Trace

## API

coming soon

## Resource

* https://github.com/Gozala/channel
* https://github.com/visionmedia/co
* https://github.com/olahol/node-csp
* http://swannodette.github.io/2013/08/24/es6-generators-and-csp
* http://golang.org/
* http://en.wikipedia.org/wiki/Communicating_sequential_processes

## License

MIT
