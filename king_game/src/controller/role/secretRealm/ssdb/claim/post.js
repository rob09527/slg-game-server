
module.exports = async (ctx) => {
    const { index } = ctx.request.body;
    let result = await global.dao.ssdbRole.findOne({ rid: ctx.role.rid })
    ctx.assert(result, 'error user info ');
    ctx.assert(result.state != 0, 'error user state ');

    let config = global.gameconfig.ssdb[1].find(e => e.LAYERS == result.layers)
    let item = config.item[index]
    ctx.assert(item, 'error index ');


    ctx.role.addItemsNoSave(item);
    await ctx.role.save()
    let update = {
        state: 0,
        layers: 0,
        try: 0,
    }
    await global.dao.ssdbRole.updateOne({ rid: ctx.role.rid }, { $set: update })

    ctx.body = item
};