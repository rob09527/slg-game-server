'use strict'

module.exports = exports = async (ctx, next) =>{
    let team = await ctx.findTeam();
    team.challenge = false;
    await team.save();
    ctx.body = {};
}