
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计消耗兵符数量
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57120,
        mark: 98435,
        count,
        subreason: 'bingfucst'
    })
}