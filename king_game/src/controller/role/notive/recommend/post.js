
'use strict'
// 新手推荐宝箱奖励
// 随机10个抽一个
module.exports = exports = async (ctx, next) => {
    // 判断是否有领取
    ctx.assert(ctx.role.getProp(94600) == 0, 'had get');
    const config = global.gameconfig.novicerecommendrewards;
    // 查出本层随机奖励
    let rate = config.deepMap('W');
    let random_items = config[ctx.random.inweight(rate)];
    // 加标记
    let reward = random_items.ITEMS;
    ctx.role.addItemsNoSave([
        ...reward,
        { gsid: 94600, count: 1 },
    ])
    await ctx.role.save();
    ctx.body = {
        reward,
    }
}