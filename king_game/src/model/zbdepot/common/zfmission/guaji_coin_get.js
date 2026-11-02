
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计挂机获取铜钱
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57040,
        mark: 98432,
        count,
        subreason: 'guajicoinget'
    })
}