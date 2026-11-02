
'use strict'
/**
 *  奇门幻阵重置次数
 * @param {*} ctx 
 * @param {*} next 
 */
module.exports = async (ctx, next) => {

    ctx.assert(ctx.bossConfig.expireAt > Date.now(), 'activity expire');
    // 判断次数是否还足够
    ctx.assert(ctx.surplusNum <= 0, 'count enough'); //

    const { CONFIG: config } = global.gameconfig.fantasy;
    // 判断重置上限
    ctx.assert(ctx.role.getProp(98005) <= config.RESETMAX, 'reset num enough');

    let items = config.RESETCOST.map(({ GSID: gsid, COUNT: count }) => ({ gsid, count }))
    // 判断物品数量
    ctx.role.castItemsNoSave(items);
    // 添加次数
    ctx.role.addItemsNoSave({ gsid: 98005, count: 1 });

    // 保存数据
    await ctx.role.save();
    ctx.body = {};
}