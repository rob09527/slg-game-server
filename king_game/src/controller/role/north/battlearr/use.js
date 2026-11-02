'use strict';
module.exports = exports = async (ctx, next) => {
    ctx.bset = await ctx.dao.north_team.find({rid: ctx.role.i()});
    await next();
}
