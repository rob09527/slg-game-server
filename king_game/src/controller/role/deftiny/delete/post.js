
'use strict'

module.exports = exports = async function (ctx, next) {
    let { guids } = ctx.request.body;
    for (let index in guids) {
        ctx.assert(ctx.tian.general[index],'already delete');
    
        delete ctx.tian.general[index].guid;

    }

    ctx.role.markModified('destiny.general');
    ctx.body = ctx.tian.general;
}