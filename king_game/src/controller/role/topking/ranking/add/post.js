
'use strict';

async function rankAdd (ctx, params) {
    let {warzone, mark } = params;
    ctx.body = {};
    // 给玩家点赞次数加1
    let user = await ctx.dao.topkingrank.findOne({ areamark: warzone, mark, finish: { $exists: 0 } });
    let num = user.support;
    user.support = num + 1;
    await user.save();
}
// 给全服霸主点赞
module.exports = exports = async (ctx, next) => {
    // 点赞次数和点赞奖励配置
    let { THUMBS_UP_NUM: num, THUMBS_UP: items } = global.gameconfig.others.TOPKINGPVP;

    let { mark = 0, warzone } = ctx.request.body;
    let nowTimes = ctx.role.getProp(94510);
    ctx.assert(nowTimes <= num,'no thumbs_up num');
    ctx.assert(warzone, 'invalid warzone');
    let params = {
        mark,
        warzone
    }
    await rankAdd(ctx, params);

    ctx.role.addItemsNoSave(items);
    ctx.role.addItemsNoSave({ gsid: 94510, count: 1 })
    ctx.role.missionInvoke('TOPKING_LIKE');
    await ctx.role.save();

    ctx.body = {
        items
    }
}
