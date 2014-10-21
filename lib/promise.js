
'use strict'

// module.exports = Promise // es6 promise

/* Using bluebird over native promise
pro:
    * good performance
    * throw exception when no error handler registered, this is
      useful for `go(function* () { ... })()` pattern, since we
      dont need to worry that promise will swallow exception
con:
    * extra dependency
*/
// module.exports = require('bluebird/js/main/promise')
module.exports = require('bluebird')
