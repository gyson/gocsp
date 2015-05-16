'use strict';

// return a promise
timeout(1000, function () {
    return 123
})

// return a channel
interval(1000, function* () {
    // ... generator function
    yield 1
    yield 2
    yield 3
    yield 4
})
