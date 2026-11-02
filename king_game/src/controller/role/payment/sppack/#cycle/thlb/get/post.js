
'use strict'
// 特惠礼包-信息展示
module.exports = exports = async function (ctx, next) {
    let THLB = ctx.config;
    let record = ctx.role.thlb || [];
    let config = THLB.filter((info, index) => {
        if (ctx.role.vip >= info.MINVIP && ctx.role.vip <= info.MAXVIP) {
            info.index = index;
            return info;
        }
    });
    ctx.body = config.map((info) => {
        let bought = record[info.index] || 0;
        return {
            maxvip: info.MAXVIP,
            minvip: info.MINVIP,
            index: info.index,
            items: info.ITEMS,
            buytime: info.LIMIT - bought,
            price: info.PRICE
        }
    })
}