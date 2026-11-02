'use strict'

// 信息查询
module.exports = async function (ctx, next) {
    const { MARK, ITEMS,GENERAL_GSID=0 } = ctx.config;
    const markCount = ctx.role.getProp(MARK);
    let needItems =  ITEMS.map((each, index) => {
        // 1 => 已达成未领取 0 => 未达成
        let status = markCount >= index + 1 ? 1 : 0;
        // 2 => 已领取
        if(ctx.role[ctx.mode][index + 1] === 1) status = 2;
        return { status, items: ctx.lowerGsid(each) }
    });
    ctx.body = {
        general_gsid:GENERAL_GSID,
        rewards:needItems
    }
}