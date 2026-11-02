
'use strict'

module.exports = exports = async (ctx, next) =>{
    ctx.assert(ctx.role.level >= global.gameconfig.function_luck.DLTP.REQUIRE_COUNT,'Not yet unlocked');
    
    let {type} = ctx.request.body;
    if (type != undefined) {
        ctx.assert(type >= 0 && type <= 5,'type error');
        if (ctx.role.dltp.map[type - 1] == undefined) {
            ctx.role.dltp.map[type - 1] = type * 1000 + 1;
            ctx.save = true;
            ctx.role.markModified("dltp.map");
        }
        if (ctx.role.dltp.mopup[type - 1] == undefined) {
            ctx.role.dltp.mopup[type - 1] = 2;
            ctx.save = true;
            ctx.role.markModified("dltp.mopup");
        }
        if (ctx.role.dltp.shop[type]  == undefined) {
            ctx.role.dltp.shop[type] = {};
            ctx.save = true;
            ctx.fixshop = true;
        }
        let now = Date.now();
        for (let pos in ctx.role.dltp.shop[type]) {
            if (ctx.role.dltp.shop[type][pos].expire < now) {
                delete ctx.role.dltp.shop[type][pos];
                !ctx.fixshop && (ctx.fixshop = true);
            }
        }
    }
    ctx.config = global.gameconfig.dilao;
    ctx.assert(ctx.config, 'config nexists')
    await next();
    if (type != undefined) {
        ctx.body.type = type;
        if (ctx.fixshop)
            ctx.role.markModified("dltp.shop."+type);
    }
    if (ctx.save) {
        await ctx.role.save();
    }
}