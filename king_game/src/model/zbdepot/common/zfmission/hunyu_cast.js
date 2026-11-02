
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计消耗魂玉数量
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57200,
        mark: 98439,
        count,
        subreason: 'hycst'
    })
}