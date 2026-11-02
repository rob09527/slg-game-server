"use strict"

module.exports = async function (ctx, next) {
    let { MARK, ITEMS: items } = ctx.config;
    ctx.assert(ctx.role.getProp(MARK) == 0, "reward");
    items = items.map(({ REWARD }) => REWARD).reduce((sum, cur) => sum.concat(cur));
    ctx.role.addItemsNoSave([
        ...items,
        { GSID: MARK, COUNT: 1 },
    ])
    await ctx.role.save();
    ctx.body = items;
}