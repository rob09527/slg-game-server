'use strict';

module.exports = exports = async function (ctx, next) {
    const rid = ctx.role.i();
    const {index = null} = ctx.request.body;
    ctx.touched = await ctx.dao.timeplay.findOne({rid,  index});
    ctx.assert(ctx.touched, 'no touch');
    await next();
};
