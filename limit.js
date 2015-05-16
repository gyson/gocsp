'no need, because pipe() cover this function'

// 'use strict';
//
// module.exports = exports = limit
//
// var Future = require('./future')
// var go = require('./go')
//
// // need this ?
// // use channel(10) can solve this problem
//
// // var ch = new Channel(10)
// //
// // pipe(p => p
// //     .from([url1, url2, url3])
// //     // limit max concurrency
// //     .mapAsync(10, function (cb, url) {
// //         // ...
// //         // ...
// //         // cb(null, exception)
// //         // return yield path()
// //     })
// //     .mapGo(10, function* (url) {
// //         // ,,,
// //         // ...
// //     })
// //     .array()
// // )
// // .done(function (err, val) {
// //     console.log(val)
// // })
//
// // function limit(max, fn) {
// //
// // }
// //
// // function wrap(max, genFun) {
// //
// // }
// // exports.wrap = wrap
//
// // var f = limit(function (cb, a, b, c) {
// //
// // })
// //
// // f(a, b, c).done(function () {
// //
// // })
// //
// // var f2 = limit.wrap(function* (a, b, c) {
// //
// // })
// //
// // f2(a, b, c).done(function () {
// //
// // })
//

// var fn = limit(100, async function (x) {
//
// })
//
// Promise.all([xxx].map(fn))

// // // limit total number of things
// // // limit(max, wrap)
// // // like wrap, but limit max concurrency
// // function limit(max, fn) {
// //     if (max !== (~~max) || max <= 0) {
// //         throw new TypeError(max + ' is not positive integer')
// //     }
// //     if (!isGeneratorFunction(fn)) {
// //         throw new TypeError(fn + ' is not generator function')
// //     }
// //
// //     var count = 0
// //     var list = new LinkList()
// //
// //     function check() {
// //         if (!list.isEmpty() && count < max) {
// //             var task = list.shift()
// //             count += 1
// //             go(task.gen)(function (err, val) {
// //                 count -= 1
// //                 task.done(err, val)
// //                 check()
// //             })
// //             check()
// //         }
// //     }
// //
// //     return function () {
// //         var gen = fn.apply(this, arguments)
// //         return thunk(function (done) {
// //             list.push(new Task(gen, done))
// //             check()
// //         })
// //     }
// // }
// // exports.limit = limit

var fn = xxx.limit(5, async function () {
    await csp.take(ch)
})

// jlimitcon // => limit max concurrency
//
// jslimit // limit max concurrency
