"use strict"

module.exports = async function (ctx, next) {
    let [ok, season, id, stime, etime] = ctx.role.isInPanda("SJTH");
    if (!ok) {
        return ctx.body = {time: -1};
    }

    ctx.assert(global.gameconfig.sjth, 'config invalid');
    ctx.config = global.gameconfig.sjth.find((value)=>{
        return value.id == id;
    })
    ctx.assert(ctx.config,"config invaild");

    ctx.type = ctx.config.TYPE;

    ctx.etime = etime;
    ctx.id = id;

    ctx.record = ctx.role.sjth[id] || [];
    if (id == 1) {
        ctx.record = ctx.role.sjth["sjzy"] || ctx.record;
    } else if (id == 2) {
        ctx.record = ctx.role.sjth["godzf"] || ctx.record;
    } else if (id == 3) {
        ctx.record = ctx.role.sjth["sgy"] || ctx.record;
    } else if (id == 4) {
        ctx.record = ctx.role.sjth["magicsmy"] || ctx.record;
    }
    ctx.assert(ctx.record, 'invalid record');

    await next();
}