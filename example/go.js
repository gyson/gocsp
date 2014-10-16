
var fs = require('fs')
var go = require('gocsp')

go.async(function* () {

    var file = yield function (cb) {
        fs.readFile(__filename, 'utf8', cb)
    }

    console.log(file)

})()
