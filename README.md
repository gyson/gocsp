## Communication Sequencial Processes in Javascript

Bring golang-like CSP channel and coroutine to Javascript

## Run

Some modules require new features from ES6.

    $ node --harmony <file>.js

## Example

```js
import { readFile, exists } from 'fs'
import { go, select, chan } from 'gocsp'

var ch1 = chan()
var ch2 = chan()

// go(function* () {
//
// })

go = function (fn) {
    return go.wrap(fn)() // make sure it always
}
go.wrap = Promise.coroutine

// go.wrap()
// go(function* () {
//
// })

Promise.coroutine(function (fn, ctx, args) {
    return yield* fn
})

go(function* () {
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

## Modules:

## [gocsp/thunk](https://github.com/gyson/gocsp/doc/thunk.md)
## [gocsp/go](https://github.com/gyson/gocsp/doc/go.md)
## [gocsp/all](https://github.com/gyson/gocsp/doc/all.md)

# Related packages:
* [gocsp-fs](https://github.com/gyson/gocsp-fs)
* [gocsp-net]
* [gocsp-http]
* [gocsp-readline](https://github.com/gyson/gocsp-readline)

## License

MIT
