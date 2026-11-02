
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计神将招募次数
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57340,
        mark: 98447,
        count,
        subreason: 'zhaomupremium'
    })
}