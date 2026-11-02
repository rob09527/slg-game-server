module.exports = exports = async (ctx) => {
    let userLimit = parseInt(ctx.gameCache.mjxxl.userLimit) + 1
    const shopId = 38005
    const role = await global.dao.role.findOne({ _id: ctx.role.id });
    const count = role.getItems(shopId).count;
    ctx.assert(userLimit <= global.gameconfig.mjxxl.shop[userLimit].count, 'sys limit num');
    ctx.assert(count > global.gameconfig.mjxxl.shop[userLimit]?.price, 'limit num');
    ctx.role.castItemsNoSave({ GSID: shopId, COUNT: global.gameconfig.mjxxl.shop[userLimit].price }, { main: 'mjxxl', sec: 'buy_' + userLimit });
    await ctx.role.save();
    ctx.gameCache.mjxxl.frequency += 1
    ctx.gameCache.mjxxl.userLimit += 1
    ctx.body = { state: "success", client_xxl: ctx.gameCache.mjxxl }
}
