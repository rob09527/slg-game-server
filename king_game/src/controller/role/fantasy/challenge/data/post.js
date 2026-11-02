
'use strict'

module.exports = exports = async (ctx) => {

    ctx.assert(ctx.bossConfig.expireAt > Date.now(), 'activity expire');
    const bossConfig = global.gameconfig.battlefantasyboss;
    ctx.assert(bossConfig, 'config nexist');

    ctx.body = bossConfig[ctx.bossConfig.bossid];
    ctx.assert(ctx.body, 'not open');
}