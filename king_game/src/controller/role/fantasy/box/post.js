'use strict'

/**
 *  获取奇门幻阵宝箱奖励
 * @param {*} ctx 
 * @param {*} next 
 */
module.exports = async (ctx, next) => {
    const { index } = ctx.request.body;
    ctx.assert(ctx.bossConfig.expireAt > Date.now(), 'activity expire');

    const { BOXCOND: cond, BOSS } = global.gameconfig.fantasy;
    let condNum = cond[index];
    let boxConfig = BOSS[ctx.bossConfig.bossidx];
    ctx.assert(boxConfig, 'config error');
    let boxRwd = boxConfig.BOX_REWARD[index];
    ctx.assert(boxRwd, 'box reward config error');

    let propNum = parseInt(98001 + index + 1);
    ctx.assert(typeof propNum == 'number', 'index fail');

    // 是否已领取
    ctx.assert(ctx.role.getProp(propNum) < 1, 'already reward');

    // 校验挑战次数是否满足
    ctx.assert(ctx.role.getProp(98001) >= +condNum, 'condition enough');

    if (!Array.isArray(boxRwd)) boxRwd = [boxRwd];
    let items = boxRwd.map(({ GSID: gsid, COUNT: count }) => ({ gsid, count }));

    // 设置标记
    ctx.role.addItemsNoSave([...items, { gsid: propNum, count: 1 }]);

    await ctx.role.save();
    ctx.body = { items };
}