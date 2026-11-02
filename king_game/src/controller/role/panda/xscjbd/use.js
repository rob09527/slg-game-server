"use strict"

module.exports = async function(ctx, next) {
    ctx.KEY = "XSCJ"
    let [ok, season, id, _t1, _t2, arg] = ctx.role.isInPanda(ctx.KEY);
    if (!ok) {
        return ctx.body = {time:-1}
    }
    ctx.config = global.gameconfig.xscj.find(value=>value.ID == id);
    ctx.assert(ctx.config, "config nexists");
    ctx.panda = global.gameconfig.panda[ctx.KEY][season];
    await next();
}