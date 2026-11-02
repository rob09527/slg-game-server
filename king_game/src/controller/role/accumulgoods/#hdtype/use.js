
'use strict'

module.exports = exports = async (ctx, next) => {
    const {hdtype = 'unkown'} = ctx.params;
    
    const toUp = hdtype.toUpperCase();
    // 是否在活动范围
    ctx.assert(ctx.zhdpoint("ISZHD", toUp), "not open");
    
    ctx.config = global.gameconfig.zhd[toUp] || global.gameconfig.zhd_newhero[toUp];
    ctx.assert(ctx.config, 'invalid activity config');

    const subtype = ctx.config.map(elem => elem.SUBTYPE)[0];
    const uidStr = ctx.role.i();
    ctx.record = await global.dao.accumulgoodfixs.findOne({rid: uidStr, hdtype, subtype});
    if(!ctx.record) {
        ctx.record = await global.dao.accumulgoodfixs.create({rid: uidStr, hdtype, subtype})
    }

    await next();
}
