
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 封地累计获取灵蕴丹
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 57480,
        mark: 98452,
        count,
        subreason: 'manorlydget'
    })
}