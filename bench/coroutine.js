
var go = require('../lib/index');
var Bluebird = require('bluebird');
var Benchmark = require('benchmark');
var Coroutine = require('../lib/coroutine');

var n = 20;

function d (resolve) {
    process.nextTick(resolve)
    //resolve(10);
    //setImmediate(resolve)
}

function thunkD(cb) {
    d(function (s) {
        cb(null, s)
    })
}

new Benchmark.Suite()

.add('task with class', function (deferred) {

    new Coroutine(function* () {
        for (var i = 0; i < n; i++) {
            yield ['task', d];
        }
        deferred.resolve();

    }(), function (err) {
        if (err) console.log('err test1:', err)
    }).next()

}, { defer: true })

.add('await bluebird', function (deferred) {

    new Coroutine(function* () {
        for (var i = 0; i < n; i++) {
            var x = yield ['await', new Bluebird(d)];
        }
        deferred.resolve();

    }(), function (err) {
        if (err) console.log('err test1:', err)
    }).next()

}, { defer: true })

.add('bluebird coroutine', function (deferred) {

    Bluebird.coroutine(function* () {

        for (var i = 0; i < n; i++) {
            yield new Bluebird(d)
        }
        deferred.resolve();
    })();

}, { defer: true })

.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
// run async
.run({ 'async': true, 'defer': true });
