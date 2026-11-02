
'use strict'
const moment = require("moment");

module.exports = exports = async (ctx, next) => {
    let config = global.gameconfig.mjxwreward;
    ctx.assert(config, 'no config');
    let START = config.START;
    ctx.assert(START, 'no START');
    ctx.assert(ctx.role.level >= START.LEVEL, 'not enough LEVEL')
    let start = 0;
    if (START.TYPE == 0) {
        start = moment(ctx.role._gameserv.start).startOf('days').valueOf();
    }
    else {
        start = moment(ctx.role.create).startOf('days').valueOf();
    }
    let etime1 = start + (parseInt(START.START) - 1) * 24 * 3600 * 1000;
    ctx.assert(Date.now() > etime1, 'not open')

    ctx.storey = config.START.STOREY;
    ctx.config = config.REWARD;
    ctx.assert(ctx.config, 'no REWARD');
    await next();
}