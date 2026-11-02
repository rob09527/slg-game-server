
module.exports = async (ctx) => {
    const { index } = ctx.request.body;
    let result = ctx.ssdb
    let day = result.box.day
    let config = global.gameconfig.ssdb[4].find(e => e.DAY == day)

    ctx.assert(config, 'config error');
    let limit = config[`BOX${index}`]
    ctx.assert(limit, 'config box limit does not exist');

    if (!result.box[day]) {
        result.box[day] = {}
    }
    if (!result.box[day][index]) {
        result.box[day][index] = 0
    }
    //检查限制
    ctx.assert(result.box[day][index] < limit, `exceeds limit${result.box[day][index]}`);

    result.box[day][index] += 1
    let item = config.item[index]
    ctx.role.addItemsNoSave(item);
    await ctx.role.save()

    let update = {}
    update[`box.${day}`] = result.box[day]

    await global.dao.ssdbRole.updateOne({ rid: ctx.role.rid }, { $set: update })

    ctx.body = item
};