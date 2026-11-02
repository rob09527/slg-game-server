//商家兑换
module.exports = async (ctx) => {
    const { pos } = ctx.request.body;
    let result = ctx.ssdb
    let config = global.gameconfig.ssdb[7].find(e => e.POS == pos)
    ctx.assert(config, 'error config ');
    ctx.assert(result.shop[pos] > 0, 'Exchange permission restricted');

    ctx.role.addItemsNoSave(config.item[0]);
    ctx.role.castItemsNoSave(config.item[1]);
    await ctx.role.save()

    let update = {}
    update[`shop.${pos}`] = result.shop[pos] - 1
    await global.dao.ssdbRole.updateOne({ rid: ctx.role.rid }, { $set: update })

    ctx.body = config.item[0]
};