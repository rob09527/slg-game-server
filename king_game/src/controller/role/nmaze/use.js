'use strict';
// 新远征
module.exports = exports = async (ctx, next) => {
    ctx.maze = await ctx.dao.nmaze.findOne({rid: ctx.role.i()});
    if (ctx.maze) {
        ctx.maze._role = ctx.role;
    }
    await next();
};
