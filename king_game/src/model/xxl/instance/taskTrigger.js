
module.exports = exports = async function (ctx, id) {
    let rid = ctx.role.id;
    let label = new Date().toISOString().slice(0, 10)
    if (!ctx.gameCache?.mjxxl || ctx.gameCache?.mjxxl?.label !== label) {
        ctx.gameCache.mjxxl = await ctx.dao.xxl.schema.methods['getDailyInfo'](rid)
    }
    ctx.gameCache.mjxxl.taskRewards[id].user_count += 1
}