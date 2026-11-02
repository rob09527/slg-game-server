/**
 * 装备兵书
 */
'use strict';

module.exports = exports = async (ctx, next) => {
    ctx.general.book =  ctx.general.book || [];
    ctx.general._book_ =  ctx.general._book_ || [];
    ctx.general.markModified('book');
    await next();
};
