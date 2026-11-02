const expireUserinfo = require("../../../../../../util/expireUserinfo");

module.exports = exports = async function (ctx, next) {
    const key = `${ctx.role._id.toString()}-prisoner`
    var cacheInfo = await expireUserinfo(key, true)
    if (!cacheInfo) {
        throw ('Please refresh and retry')
    }
    cacheInfo.battle.revive += 1
    await expireUserinfo(key, false, cacheInfo)
    let config = global.gameconfig.surrenderfight[3].find(e => e.REVIVE == cacheInfo.battle.revive)
    ctx.assert(config, 'End of frequency');

    ctx.role.castItemsNoSave(config.item);
    await ctx.role.save()
    ctx.body = {
        message: "success",
        item: config.item
    }
};