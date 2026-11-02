'use strict';

/*
* 国战军衔天赋
* */
module.exports = exports = async (ctx, next) => {
    ctx.assert(false,'no open nationwar talent');
    await next();
    const roleinfo = await ctx.role.base();
    await ctx.role.save();
    ctx.body.power = roleinfo.power;
    ctx.body.generals = roleinfo.general;
};
