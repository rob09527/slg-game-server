
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计消耗君王令数量
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57180,
        mark: 98438,
        count,
        subreason: 'jwlcst'
    })
}