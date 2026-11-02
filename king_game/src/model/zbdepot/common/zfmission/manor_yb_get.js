
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计封地元宝数
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57380,
        mark: 98451,
        count,
        subreason: 'bigbattle'
    })
}