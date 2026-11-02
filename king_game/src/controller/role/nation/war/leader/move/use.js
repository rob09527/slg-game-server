'use strict';
const ms = require('ms');
module.exports = exports = async (ctx, next) => {
    const { MOVE_TEAM_INTERVAL: team_inteval = 1 } = global.gameconfig.nationwar.BASE;
    ctx.assert(ctx.nationwarInfo.rid == ctx.role._id, 'no allowed');
    let info = ctx.nation_match
    // 指挥官可操作状态
    ctx.assert(info, 'invalid nation info');
    ctx.assert(info.state == 1 && Date.now() > (info.nextroundtime - ms(`${team_inteval}h`)) || info.state == 2, 'invalid move team time');
    ctx.nation_state = info.state;
    await next();
};
