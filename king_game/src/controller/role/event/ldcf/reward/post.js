'use strict'

// 领取奖励
module.exports = exports = async function (ctx, next) {
    const { LDCF: {
        LIMIT, MARK, PMARK,
        REWARDS: items,
    } } = global.gameconfig.zhd;
    const getCount = ctx.role.getProp(PMARK);
    const markCount = ctx.role.getProp(MARK);
    ctx.assert(markCount > 0 && getCount < LIMIT, "not enough");
    // 一键领取所有奖励
    const buytime = ctx.zhdpoint('LDCFREWARD', ctx.role);
    let reward = items.map(({ GSID, COUNT }) => ({ GSID, COUNT: COUNT * buytime}));
    ctx.role.addItemsNoSave([{ GSID: PMARK, COUNT: buytime }, ...reward]);
    ctx.role.castItemsNoSave({ GSID: MARK, COUNT: buytime });
    await ctx.role.save();
    ctx.body = {
        buytime: 0,
        items: reward,
    };
    // 周活动日志-龙帝赐福
    ctx.zhdprint('ldcf');
}