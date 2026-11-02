
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计挂机获取进阶丹
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57460,
        mark: 98434,
        count,
        subreason: 'guajijjsget'
    })
}