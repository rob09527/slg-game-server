module.exports = exports = async (ctx) => {
    let { index } = ctx.request.body;
    const { score, chestRewards } = ctx.gameCache.mjxxl
    console.log(chestRewards[index].inscore)
    ctx.assert(chestRewards[index].inscore < score, 'Not satisfied with the score');
    ctx.assert(chestRewards[index].state < 1, 'Already received');
    const items = chestRewards[index].items

    await ctx.role.addItemsNoSave(items, { main: `mjxxl-box-${index}`, sec: 'mjxxl' });
    ctx.gameCache.mjxxl.chestRewards[index].state = 1
    await ctx.role.save();
    ctx.body = items
}
