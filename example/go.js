
var fs = require('fs')
var go = require('gocsp')

var chan1 = new go.Channel()
var chan2 = new go.Channel()

go(function* () {
    // sleep for 1 second
    yield go.sleep(1000)

    // read file
    var file = yield cb => fs.readFile(__filename, 'utf8', cb)

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
})()
