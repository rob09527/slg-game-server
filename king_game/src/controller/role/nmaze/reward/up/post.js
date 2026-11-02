'use strict'

module.exports = exports = async (ctx) => {

    let {index = 0} = ctx.request.body;
    let items;
    if(ctx.maze.boxreward) {
        items = ctx.maze.boxreward;
        ctx.maze.boxreward = null;
        ctx.role.addItemsNoSave(items);
        await ctx.role.save();
    }
    let cardid;
    if(ctx.maze.cardlist && ctx.maze.cardlist[index]){
        cardid = ctx.maze.cardlist[index];
        ctx.maze.selcards = ctx.maze.selcards || [];
        ctx.maze.selcards.push(cardid);
        ctx.maze.markModified('selcards');
        ctx.maze.cardlist = null;
    }
    await ctx.maze.save();
    ctx.body = {
        items,
        cardid
    };
}
