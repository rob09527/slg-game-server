'use strict'

// 信息查询
module.exports = async function (ctx, next) {
    const { MARK, ITEMS } = ctx.config;
    const markCount = ctx.role.getProp(MARK);
    const record = ctx.role[ctx.ljcz] || [];
    ctx.body = [];
    ITEMS.forEach((each, index)=>{
        if (each.UNLOCK && markCount < each.UNLOCK) return false;
        // 1 => 已达成未领取 2 => 未达成
        let status = markCount >= each.NUM ? 1 : 0;
        // 0 => 已领取
        if (record[index] === 1) status = 2;
        ctx.body.push({ price: each.NUM, status, items: ctx.lowerGsid(each.ITEMS) })
    })
}