'use strict'

module.exports = exports = async (ctx, next) =>{
    let save = false;
    if (ctx.team.challengerid != ctx.rid) {
        ctx.team.challengerid = ctx.rid;
        save = true;
    }
    if (Date.now() - ctx.team.challengetime > ctx.challengetime) {
        ctx.team.challengetime = Date.now();
        ctx.team.challenge = false;
        save = true;
    }
    if (save) await ctx.team.save();

    let { pos } = ctx.request.body;
    let maps = Object.values(ctx.config.TEAMID[pos].MAPS);

    let battle = global.gameconfig['battle'+ctx.config.TEAMTYPE];
    let list = maps.map((ID)=>{
        return {
            config: battle[ID],
            boss: ctx.config.TEAMID[pos].BOSS.MAPID == ID ? ctx.config.TEAMID[pos].BOSS.BOSS : 0,
            headid: ctx.config.TEAMID[pos].HEADICON[ID],
        }
    })

    ctx.body = {
        list,
        team: await ctx.team.getplayer(),
        time: ctx.challengetime / 1000,
    }
}