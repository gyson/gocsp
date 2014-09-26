
var go = require('../lib/index')
var assert = require('assert')

// test buffer
var buf = go.Channel.buffer(3)

buf.put(1)
buf.put(2)
buf.put(3)
buf.put(4)
buf.put(5)
buf.put(6)
buf.close('DONE')

go.spawn(function* () {
    assert((yield go('take', buf)).value === 1)
    assert((yield go('take', buf)).value === 2)
    assert((yield go('take', buf)).value === 3)
    assert((yield go('take', buf)).value === 'DONE')
})
