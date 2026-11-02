
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计挂机获取武将经验
 */
module.exports = function ({ type, count }) {
    return chkAndAdd.call(this,{
        zbId: 57100,
        mark: 98433,
        count,
        subreason: 'guajigexpget'
    })
}