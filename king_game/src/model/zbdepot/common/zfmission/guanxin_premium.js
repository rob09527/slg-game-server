
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计高级观星次数
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57360,
        mark: 98444,
        count,
        subreason: 'guanxinnormal'
    })
}