
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计普通观星次数
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57320,
        mark: 98445,
        count,
        subreason: 'guanxinnormal'
    })
}