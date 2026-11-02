'use strict'

module.exports = exports = async (ctx) => {

    let {star} = ctx.request.body;

    ctx.assert(ctx.maze.star >= star, 'no_more star');

    const items = ctx.maze.battleRewards(1, star);
    const starrewards = ctx.maze.starrewards || [];
    const r = starrewards.find(o => o === +star);
    ctx.assert(!r, 'already get');

    ctx.role.addItemsNoSave(items);
    starrewards.push(+star);
    ctx.maze.markModified('starrewards');
    await ctx.role.save();
    await ctx.maze.save();
    ctx.body = {
        items
    };
}
