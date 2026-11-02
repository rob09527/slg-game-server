
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计珍宝高级寻宝次数
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57540,
        mark: 98455,
        count,
        subreason: 'zb_premium_roll'
    })
}