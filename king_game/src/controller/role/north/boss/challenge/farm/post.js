'use strict';

module.exports = exports = async (ctx) => {
    let {times} = ctx.request.body;
    times = parseInt(times) || 1;
    const team = ctx.team;
    const {CONFIG: {CAST_VIT = 1}} = global.gameconfig.north_fight;


    const lastdamge = ctx.boss.lastdamge && ctx.boss.lastdamge[ctx.role.i()] && ctx.boss.lastdamge[ctx.role.i()][team.type]  ? ctx.boss.lastdamge[ctx.role.i()][team.type]  : 0;
    ctx.assert(lastdamge, 'no lastdamge');
    ctx.all_damge = 0;
    for (let i = 0; i < times; i++) {
        if (ctx.boss.totaldamge >= ctx.config.BOSSHP) {
            times = i;
            break;
        }
        ctx.boss.totaldamge += lastdamge;
        ctx.all_damge += lastdamge;
    }
    ctx.times = times;

    ctx.body = {
        team,
        boss: ctx.boss
    };

};
