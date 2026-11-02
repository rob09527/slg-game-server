'use strict';

module.exports = exports = async (ctx, next) => {

    const {guids} = ctx.request.body;

    ctx.generalMap = await ctx.role.findGenerals(Array.isArray(guids) ? guids : undefined);
    await next();
};
