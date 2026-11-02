
'use strict'
// 判断前一个节点是否完成
module.exports = exports = function () {
    return this.nodes[this.row][this.pos].state == 1;
}