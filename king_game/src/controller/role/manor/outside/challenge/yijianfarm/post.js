'use strict'
//  快速扫荡, 直接拿粮草兑换奖励
const moment = require('moment');
module.exports = exports = async ctx => {
    let { times = 1 } = ctx.request.body;
    const { SWEEP_LOCK: sweep_lock = 5 } = global.gameconfig.newmanor.CONFIG
    const { FARMS_ITEMS: farms_items = [] } = global.gameconfig.newmanor_monster[ctx.manor.monsterlv]
    ctx.assert(ctx.role.getProp(97054) >= sweep_lock, 'lv no enough');
    let food_count = ctx.role.getProp(38007);
    ctx.assert(food_count >= times, 'no count');
    let items = [];
    items = farms_items.map(item => {
        return {
            GSID: item.GSID,
            COUNT: item.COUNT * times
        }
    });
    ctx.role.castItemsNoSave({ gsid: 38007, count: times });
    ctx.role.addItemsNoSave(items);
    await global.dao.warorder.point(ctx.role, 90565,times);  // 卧龙战令-府邸扫荡
    await ctx.role.save();

    ctx.body = {
        reward: items
    };
}