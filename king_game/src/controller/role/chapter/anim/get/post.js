'use strict'

/**
 * 动画奖励领取
 */
module.exports = exports = async (ctx, next) => {
    let {id} = ctx.request.body;
    id = parseInt(id || 0);
    ctx.assert(ctx.role.maxmapid >= id, `chapter ${id} not pass ${ctx.role.maxmapid}`);
    const config = global.gameconfig.chapterAnimReward[id];
    ctx.assert(config, `config ${id} not exist`);
    ctx.assert(!ctx.CACHE[id], `received reward ${id}`);

    ctx.role.addItemsNoSave(config.ITEMS, {main: 'chapter', sec: 'anim'});
    ctx.CACHE[id] = Date.now();
    ctx.role.chapterAnim = ctx.CACHE;
    ctx.role.markModified('chapterAnim');
    await ctx.role.save();

    ctx.body = {id}
}
