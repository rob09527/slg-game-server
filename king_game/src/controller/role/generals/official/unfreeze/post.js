'use strict';

//  位置冻结解冻
module.exports = exports = async (ctx, next) => {

    // 目前只要解锁随从
    ctx.request.body.type = 'retinue'; // 目前只有 随从才需要 解冻
    const {type, pos} = ctx.request.body;
    const GEN = ctx.gOfficial[type];

    ctx.assert(GEN[pos] !== undefined, 'unlocked pos'); // 未解锁的 位置
    ctx.assert((""+GEN[pos]).length !== 24, 'pos is set'); // 位置已经被设置
    ctx.assert((GEN[pos]||0) >= Date.now(), 'pos is unfreeze');

    const refreshConfig = ctx.config[`REFRESH_${type.toUpperCase()}`]; // 刷新冻结配置
    ctx.body = {
        castitems: refreshConfig.REFRESH_CONSUME,
    };
    ctx.role.castItemsNoSave(ctx.body.castitems);
    GEN[pos] = null;
    ctx.role.markModified('general_official');
    await ctx.role.save();
};
