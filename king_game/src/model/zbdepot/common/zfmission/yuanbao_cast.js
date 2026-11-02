
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计消耗元宝数量
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57140,
        mark: 98436,
        count,
        subreason: 'ybcst'
    })
}