
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计远征星级数
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57300,
        mark: 98430,
        count,
        subreason: 'nmazestar'
    })
}