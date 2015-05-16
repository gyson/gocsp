

// timeout
// interval

function interval(p, time, fn) {
    p.from(function (done, _, output) {
        var ref = setInterval(function () {
            output.put() // ...
        })

        output.done()(function () {
            // stop it
        })
        // if it's cancelled, just stop it
        // function result() {
        //
        // }
    })
}
exports.interval = interval

// timer()

// chan(123)

// timer interval

// interval(1000).take(10)

// timeout(1000)
// interval(1000)

// timeout(100, function () {
//     return 123
//     throw 123
// })
// interval(10, function* () {
//     yield 1
//     yield 2
//     yield 3
//     yield 4
//     ...
// })

// timer.timeout
// timer.interval(10) // =>
// pipe(p => p
//     .use(timer.interval, 1000, function* () {
//         yield 1 // iteraver
//     })
//     .each(console.log)
// )

// { timeout } from 'gocsp/timer'
