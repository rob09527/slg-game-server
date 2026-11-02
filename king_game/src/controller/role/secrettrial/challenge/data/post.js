
'use strict'

module.exports = exports = async (ctx) => {

    const bossConfig = global.gameconfig.battlesecrettrialboss;
    ctx.assert(bossConfig, 'config nexist');

    ctx.body = bossConfig[ctx.curLevelId];
    ctx.assert(ctx.body, 'not open');
}