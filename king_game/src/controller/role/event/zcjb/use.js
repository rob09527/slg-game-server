"use strict"

// 招财进宝
module.exports = async function (ctx, next) {
    ctx.assert(ctx.zhdpoint("ISZHD", "zcjb"), "not open")
    ctx.config = global.gameconfig.zhd.ZCJB
    ctx.assert(ctx.config, "invalid config")
    ctx.record = ctx.role.zcjb || {
        dayfree: 0,
        dayhit: 0,
        daycoin: 0,
        log: [],
        box: [],
    }
    const { LEVELCOIN } = ctx.config
    let addItems = [] // 每次招财获取的铜钱数
    const level = ctx.role.level
    for (const { RANGE, GET, EXT } of LEVELCOIN) {
        let [min, max] = RANGE
        if (level >= min && level <= max) {
            addItems.push(...GET)
            addItems.push(...EXT)
            break
        }
    }
    ctx.assert(addItems.length > 0, "invalid levelcoin")
    ctx.addItems = addItems.arrange()
    await next()
}