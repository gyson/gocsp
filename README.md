## Communication Sequential Processes in Javascript

Bring Golang-like CSP channel to JS land.

It's based on Promise and works well with generator or async-await function.

## Installation

```
$ npm install gocsp
```

## Usage

Very similar to how channel works in Golang. You can take, put or select values from channels.

```js
var co = require('co')
var csp = require('gocsp')

// from http://talks.golang.org/2013/advconc.slide#6

var player = co.wrap(function* (name, ch) {
    for (;;) {
        var ball = (yield csp.take(ch)).value
        ball += 1
        console.log(name, ball)
        yield csp.timeout(100)
        yield csp.put(ch, ball)
    }
})

co(function* () {
    var ch = csp.chan()

    player('ping', ch)
    player('pong', ch)

    yield csp.put(ch, 0)
    yield csp.timeout(1000)
    yield csp.take(ch)
})
```

## API

#### `csp.chan(size)`

Create a channel. You can optional support a queue size, default is 0.

```js
csp.chan() // without queue

csp.chan(2) // with queue size 2
```
---
#### `csp.take(ch)`

Take a value from channel, returns a promise

```js
csp.take(ch).then(function (result) {
    var { done, value } = result
    if (done) {
        // channel is closed, fail to take a value
    } else {
        // success to take value
        console.log(value)
    }
})
```
---
#### `csp.put(ch, value)`

Put a value into channel, return a promise

```js
csp.put(ch, value).then(function (ok) {
    // if success, then `ok === true`
    // if failed (e.g. channel closed), then `ok === fasle`
})
```
---
#### `csp.close(ch)`

Close a channel. When channel is closed, you cannot put values into it anymore. You may still be able to take remaining queued values from channel.

```js
csp.close(ch)
```
---
#### `csp.select(fn)`

Choose one of a set of take or put, timeout operations. At most one will success and rest will be cancelled.

```js
csp.select(function (s) {
    s.take(ch, function (result) {
        // like `csp.take`, result have two property: `done` & `value`
        var { done, value } = result
    })
    ||
    s.put(ch2, value, function (ok) {
        // ok is boolean
    })
    ||
    s.timeout(1000, function () {

    })
    ||
    s.default(function () {
        // if none of above chosen. They will all be cancelled.
        // and this function will be called.
    })
})
```

## License

MIT
