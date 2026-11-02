
'use strict'
// 挂机掉落-查询
module.exports = exports = async function (ctx, next) {
    let record = ctx.role[ctx.mode] || [];
    ctx.body = ctx.GJDL.map((info, index) => {
        let bought = record[index] || 0;
        return {
            consume: info.CAST,
            items: info.ITEMS,
            buytime: info.LIMIT == -1 ? -1 : info.LIMIT - bought,
        }
    })
}