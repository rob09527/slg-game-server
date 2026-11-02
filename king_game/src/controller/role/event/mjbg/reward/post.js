'use strict'

// 挖宝箱
module.exports = exports = async function (ctx, next) {
    let { ITEMS, FINALLIST, CONSUME } = global.gameconfig.zhd_mjbg
    let { index } = ctx.request.body
    index = parseInt(index)
    let current = ctx.role.mjbg.index //当前楼层
    current = parseInt(current)
    // 不能重复抽取
    ctx.assert(ctx.role.mjbg.open[index] === 0, "rewarded")
    let reward = {}
    reward = await ctx.getreward(current, ITEMS, FINALLIST, CONSUME)
    ctx.assert(reward, 'rewarded all')
    ctx.role.mjbg.open[index] = 1
    ctx.role.markModified('mjbg.open')
    ctx.role.castItemsNoSave(CONSUME[current])
    let isLastFloor = current == FINALLIST.length - 1;
    ctx.zhdfloor();
    if(!isLastFloor && ctx.role.mjbg.open.filter(each => each === 0).length === 0) {
        // 抽取最后一个时自动进入下一层
        await ctx.nextfloor()
    }
    await ctx.role.save()
    ctx.body = { gsid: reward.GSID, count: reward.COUNT }
}
