
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计点将次数
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57280,
        mark: 98443,
        count,
        subreason: 'dianjiang'
    })
}