'use strict';

// 新远征
module.exports = exports = async (ctx, next) => {
    ctx.assert(ctx.maze, 'maze expire');
    await next();
};
