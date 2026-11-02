
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计消耗灵蕴丹
 */
module.exports = function ({ count }) {
    return chkAndAdd.call(this,{
        zbId: 0, // 57480, // 撼岳珍宝
        mark: 0, // 98452, // 表示累积获得
        count,
        subreason: 'lydcst'
    })
}