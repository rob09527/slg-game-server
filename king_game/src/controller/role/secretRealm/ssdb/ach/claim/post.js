//成就奖励领取
module.exports = async (ctx) => {
    const { cnum } = ctx.request.body;
    let result = ctx.ssdb
    let config = global.gameconfig.ssdb[5].find(e => e.CNUM == cnum)
    ctx.assert(config, 'config error');

    let checkcount = ctx.role.getItems(99774).count
    ctx.assert(checkcount >= cnum, 'Insufficient props');
    ctx.assert(!result['ach'][cnum], 'Repeat claim');
    ctx.role.addItemsNoSave(config.item);
    await ctx.role.save()
    let update = {}
    update[`ach.${cnum}`] = true

    await global.dao.ssdbRole.updateOne({ rid: ctx.role.rid }, { $set: update })

    ctx.body = config.item
};