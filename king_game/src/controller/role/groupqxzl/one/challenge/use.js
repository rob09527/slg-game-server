'use strict'

module.exports = exports = async (ctx, next) =>{
    let findError = ()=>{
        if (ctx.request.body.type == 1 && ctx.qxzl.val <= 0) {
            return 113;
        }
        else if (ctx.request.body.type > 2) {
            return 112;
        }
        else if (ctx.pos > ctx.qxzl.pos) {
            return 127;
        }
        else if (ctx.config.LIMIT[ctx.pos] > ctx.role.level) {
            return 106;
        }
        let mapid = Object.keys(ctx.config.LIMIT);
        if (ctx.qxzl.pos > mapid[mapid.length - 1]) {
            return 125;
        }
        return 0
    }
    ctx.pos = ctx.qxzl.pos;
    if (ctx.request.body.type == 2) {
        ctx.pos = ctx.request.body.mapid || ctx.qxzl.pos;
    }
    let status = findError();
    ctx.assert(!status, status);
    await next();
}