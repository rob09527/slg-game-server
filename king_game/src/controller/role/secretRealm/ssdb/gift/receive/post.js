//神树商家礼包
module.exports = async (ctx) => {
    const { id } = ctx.request.body;
    let result = ctx.ssdb
    let config = global.gameconfig.ssdb[3].find(e => e.ID == id)
    ctx.assert(config, 'error config ');
    ctx.assert(result.gift, 'error ssdb gift info');
    ctx.assert(result.gift[id] < config.LIMITNUM || !result.gift[id], 'Exceeding the maximum number of purchases');
    if (config.TYPE == -1) {
        //元宝付费
        ctx.role.castItemsNoSave({ gsid: 38005, count: config.PRICE });
    } else if (config.TYPE == 0) {
    } else {
        ctx.assert(false, 'error buy type');
        return
    }

    //更新限购次数 
    let update = {}
    update[`gift.${id}`] = result.gift[id] ? result.gift[id] + 1 : 1
    await global.dao.ssdbRole.updateOne({ rid: ctx.role.rid }, { $set: update })

    ctx.role.addItemsNoSave(config.item);


    ctx.body = config.item
};