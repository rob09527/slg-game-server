
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计名将招募次数
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57080,
        mark: 98446,
        count,
        subreason: 'zhaomunormal'
    })
}