
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计武将置换次数
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57160,
        mark: 98442,
        count,
        subreason: 'gexchange'
    })
}