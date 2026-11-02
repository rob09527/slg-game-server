
'use strict'
// 周主题基金(周活动签到)领取奖励
module.exports = exports = async function (ctx, next) {
    let { type } = ctx.request.body;
    let { ITEMS: items } = ctx.config
    ctx.assert(items, 'invalid config');
    let key = ctx.role.isXS(`xs_zztjj_${type}`) ? `zztjj_${type}`:`zztjj1_${type}`
    if(type == 'dj' || type == 'gz' ){
       key = `zztjj_${type}`;
    }
    let record = ctx.role[key] || {};
    let ispay = record.ispay || 0;
    let num = record.num || 0;
    // 判断是否购买了
    ctx.assert(ispay == 1, 'need pay');
    // 是否有剩余次数
    ctx.assert(ctx.zzzjj_time + 1 - num > 0, 'no num');
    // 次数增加
    record.num = ++num;
    ctx.role[key] = record;
    // 增加奖励
    ctx.role.addItemsNoSave(items, { main: key })
    ctx.role.markModified(key);
    await ctx.role.save();
    ctx.body = {
        items
    }
}