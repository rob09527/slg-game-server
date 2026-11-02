
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计挂机获取武将经验
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57420,
        mark: 98450,
        count,
        subreason: 'bigbattle'
    })
}