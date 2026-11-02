//通行证
module.exports = async (ctx) => {
    const { day, vip } = ctx.request.body;
    let result = ctx.ssdb
    let config = global.gameconfig.ssdb[6].find(e => e.DAY == day)
    ctx.assert(config, 'error config ');
    ctx.assert(day <= result.txz.day, 'day error');

    let type = 'noral'
    let key = 'ssdbtxz'
    let item
    if (vip && ctx.role.special[key] && Date.now() < ctx.role.special[key]) {
        type = 'vip'
        item = JSON.parse(JSON.stringify(config.item))
        item = item.splice(2, item.length)
        ctx.role.addItemsNoSave(item);
    } else if (!vip) {
        //第一个是补领消耗
        if (day !== result.txz.day) {
            ctx.role.castItemsNoSave(config.item[0]);
        }
        ctx.role.addItemsNoSave(config.item[1]);
        item = config.item[1]
    } else {
        ctx.assert(false, 'not vip');
    }

    if (!result.txz[day]) {
        result.txz[day] = {}
    }
    ctx.assert(!result.txz[day][type], 'Repeat Claim');

    await ctx.role.save()

    let update = {}
    update[`txz.${day}.${type}`] = true
    await global.dao.ssdbRole.updateOne({ rid: ctx.role.rid }, { $set: update })

    ctx.body = item
};