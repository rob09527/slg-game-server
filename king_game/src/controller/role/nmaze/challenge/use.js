'use strict';

// 新远征
module.exports = exports = async (ctx, next) => {
    const {mapid} = ctx.request.body;
    ctx.assert(ctx.maze, 'maze expire');
    ctx.assert(ctx.maze.mapid == mapid, 'maze expire');
    ctx.assert(!ctx.maze.ispass, 'maze passed');

    ctx.maze._role = ctx.role;
    await next();
};
