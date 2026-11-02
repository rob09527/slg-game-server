'use strict';
// 北伐匈奴
module.exports = exports = async (ctx, next) => {
    assert(ctx.dao.north.isInTime(), 'not start');
    await next();
};
