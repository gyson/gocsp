
'use strict'

module.exports = LinkList

function LinkList() {
    this.next = this
    this.prev = this
}

// remove the most idle item from the list
LinkList.prototype.shift = function () {
    if (this.isEmpty()) {
        throw new Error('Cannot shift from empty list')
    }
    return remove(this.next)
}

// remove a item from its list
function remove(item) {
    item.next.prev = item.prev
    item.prev.next = item.next
    item.prev = null
    item.next = null
    return item.data
}
LinkList.remove = remove

// remove a item from its list and place at the end.
LinkList.prototype.push = function (data) {
    var item = {
        data: data,
        next: this,
        prev: this.prev
    }
    this.prev.next = item
    this.prev = item
    return item
}

LinkList.prototype.isEmpty = function () {
  return this.prev === this
}
