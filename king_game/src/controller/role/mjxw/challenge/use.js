
'use strict'

module.exports = exports = async (ctx, next) =>{
    let info = ctx.config[ctx.role.getProp(ctx.storey)];
    ctx.assert(info,'no info');
    ctx.reward = info.map(value=>{
        return value
    })
    await next();
}