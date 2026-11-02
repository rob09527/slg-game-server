
'use strict'
const moment = require('moment');
// 封地-领取粮草
module.exports = exports = async ctx => {
    const { VIP: vip } = global.gameconfig.others.MANOR;
    const { FOOD_MAX: food_max } = global.gameconfig.newmanor.CONFIG;
    ctx.assert(ctx.role.special['fd'] > 0 && ctx.role.getProp(97199) == 0, 'has get');
    ctx.assert(vip, 'invalid config');
    // 超过拥有最大值则需要消耗掉才能领
    ctx.assert(ctx.role.getProp(38007) < food_max, 'need cast');
    ctx.role.addItemsNoSave(vip);
    ctx.role.addItemsNoSave({ gsid: 97199, count: 1 })
    await ctx.role.save();
    ctx.body = {
        items: vip
    }
}