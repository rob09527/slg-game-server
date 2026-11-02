"use strict"

// 招财
module.exports = async function (ctx, next) {
    const { times = 1 } = ctx.request.body
    const {
        COST,
        FREELIMIT,      // 免费次数
        MAXLIMIT,       // 总招财次数
        HITRATE,        // 暴击概率（两位数）
        HIT,            // 倍率权重
    } = ctx.config
    let castItems = (COST.find(({ TIME }) => TIME == times) || {}).ITEM
    ctx.assert(castItems, "invalid times")
    ctx.assert(ctx.record.dayhit < MAXLIMIT, "hit limited")
    ctx.record.dayhit += times
    if (times == 1 && ctx.record.dayfree < FREELIMIT) {
        ctx.record.dayfree++
    } else {
        castItems = castItems.map(({ GSID, COUNT }) => ({ GSID, COUNT: COUNT * times }))
        ctx.role.castItemsNoSave(castItems)
    }
    const items = [] // 招财获得的奖励
    for (let i = 0; i < times; i++) {
        let isHit = ctx.random.hit(HITRATE) // 是否暴击
        let beilv = 1 // 奖励倍率
        if (isHit) {
            const rate = HIT.deepMap("WEIGH")
            beilv = HIT[ctx.random.inweight(rate)].NUM
        }
        items.push({
            beilv, reward: ctx.addItems.map(({ GSID, COUNT }) => ({ GSID, COUNT: COUNT * beilv }))
        })
    }
    let rewards = items.map(({ reward }) => reward)
        .reduce((sum, cur) => sum.concat(cur))
        .arrange()
    ctx.role.addItemsNoSave(rewards)
    // 每日招财记录
    const get = rewards.map(({ COUNT }) => COUNT).reduce((sum, cur) => sum + cur)
    ctx.daycoin += get
    ctx.record.log.push({
        get,
        time: Date.now(),
        count: times,
        cost: castItems.map(({ COUNT }) => COUNT).reduce((sum, cur) => sum + cur),
    })
    ctx.role.zcjb = ctx.record
    ctx.role.markModified("zcjb")
    await ctx.role.save()
    ctx.body = {
        items,
    }
}