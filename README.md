## Communication Sequential Processes in Javascript

Bring golang-like CSP channel and operations to JS land.

## Installation

```
$ npm install gocsp
```

## Usage

Very similar to how channel works in Golang. You can take, put or select items from channels.

```js
var csp = require('gocsp')

```

## API

#### `csp.chan(size)`

create a channel. You can optional support a size.

Example:
```js
csp.chan() // without buffer

csp.chan(2) // with buffer size 2
```
---
#### `csp.take(ch)`

take an item from chanenl, returns a promise

```js
csp.take(ch).then(function (result) {
    result.done  //
    result.value //
})
```
---
#### `csp.put(ch, value)`

put an item into channel, return a promise

```js
csp.put(ch, value).then(function (ok) {
    // if success, ok is true
    // if failed (channel closed), ok is false
})
```
---
#### `csp.close(ch)`

close a channel. When channel is closed, you cannot put value into it. You may still be able to take remaining queued items from channel until it's clear.

```js
csp.close(ch)
```
---
#### `csp.select(fn)`

choose one of a set of take or put operations. At most one will success and rest will be cancelled.

short cut.

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
        // if none of above choosen. They will all be cancelled.
        // and this function will be called.
    })
})
```

## License

MIT
