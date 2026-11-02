'use strict'


/**
 * 军团详情查询
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {
    const {id} = ctx.request.body;
    ctx.assert(id, 'miss id');
    let legion = await ctx.dao.legion.findOne({_id: id});
    ctx.assert(legion, 'not found legion');
    legion = await legion.base();
    ctx.body = legion;
}
