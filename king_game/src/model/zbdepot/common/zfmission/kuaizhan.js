
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 快速扫荡次数
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57060,
        mark: 98431,
        count,
        subreason: 'kuaizhan'
    })
}