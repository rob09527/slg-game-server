
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计消耗招募状数量
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57240,
        mark: 98441,
        count,
        subreason: 'zmzcst'
    })
}