'use strict'

module.exports = exports = async (ctx, next) =>{
    const cond = {
        type: ctx.type,
        'fellows.2': {$exists:0},
    };
    let teams = await ctx.dao.c_qxzlteam.find(cond, {_id:1});
    teams.shuffle();
    let tmp = [];
    for (const doc of teams) {
        if (tmp.length >= 20) break;
        let team = await ctx.dao.c_qxzlteam.findOne({_id: doc._id});
        if (!team) continue;
        team = await team.base();
        tmp.push(team);
    }
    let qxzl = await ctx.dao.c_qxzl.findOne({rid:ctx.role.i(), type:2});
    let find = await ctx.findTeam();
    ctx.body = {
        list:tmp, 
        allHelp:ctx.config.HELPVAL?ctx.config.HELPVAL:5, 
        help:qxzl.help, 
        team:find ? await find.base() : null,
    };
}