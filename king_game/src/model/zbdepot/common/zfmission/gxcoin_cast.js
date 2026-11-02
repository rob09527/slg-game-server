
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计消耗观星币数量
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57220,
        mark: 98440,
        count,
        subreason: 'gxcoincst'
    })
}