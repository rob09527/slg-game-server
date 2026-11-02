'use strict';
// 内部军团更新接口
module.exports = exports = async function (ctx, next) {
    const upd = {[ctx.params.key]: ctx.request.body[ctx.params.key]};

    const r = await ctx.dao.legion.updateOne({_id: ctx.legion._id}, {$set: upd});
    ctx.body = r;
};
