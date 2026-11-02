'use strict'

module.exports = exports = async (ctx, next) =>{
    let { team } = ctx.request.body;
    ctx.assert(team.length == ctx.team.fellows.length,'126')

    for (let {rid, help} of team) {
        let pos = ctx.team.fellows.findIndex(value=>value.rid == rid && value.help == help);
        if (pos == -1) {return ctx.body = {state:1}};
        ctx.team.fellows.splice(pos, 1);
    }

    ctx.team.fellows = team;
    ctx.team.markModified('fellows');
    if (ctx.team.challengerid != ctx.rid) ctx.team.challengerid = ctx.rid;
    if (Date.now() - ctx.team.challengetime > ctx.challengetime) {
        ctx.team.challengetime = Date.now();
        ctx.team.challenge = false;
    }
    await ctx.team.save();
    ctx.body = {
        state:0,
        list: await ctx.team.getplayer(),
    };
}