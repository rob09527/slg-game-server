
'use strict'

module.exports = exports = async (ctx, next) =>{
    ctx.body = {
        mopup:ctx.role.dltp.mopup,
        shop: [],
    }
    let now = Date.now();
    for (let type = 1; type <= 5; type++) {
        ctx.body.shop[type - 1] = 0;
        for (let pos in ctx.role.dltp.shop[type]) {
            if (ctx.role.dltp.shop[type][pos].expire >= now) {
                ctx.body.shop[type - 1] = 1;
                break;
            }
        }
    }
}