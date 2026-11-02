'use strict';
// 充值返利
module.exports = exports = async (ctx, next) => {
    ctx.body = ctx.CACHE
    ctx.body.stage = global.config.REBATE ? global.config.REBATE : 0;
};
