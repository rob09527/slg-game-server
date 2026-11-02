'use strict';

module.exports = exports = async (ctx) => {
    let {battleset} = ctx.request.body;
    const hasGuid = {};
    const generalMap = {};
    Object.keys(ctx.team.bset.team).forEach(pos => {
        const t = ctx.team.bset.team[pos];
        hasGuid[t.guid] = pos;
        generalMap[t.guid] = t;
    });
    const setTeam = Object.values( battleset.team);

    for (const k of  setTeam) {
        ctx.assert(hasGuid[k], 'no lock general ' + k);
    }
    ctx.team.bset.team = {};
    for (const pos in  battleset.team) {
        const t = battleset.team[pos];
        ctx.team.bset.team[pos] = generalMap[t];
        generalMap[t] = 0;
    }

    for (const guid in hasGuid) {
        const pos = hasGuid[guid];
        if (generalMap[guid] && ctx.team.bset.team[pos].guid == guid){ // 如果 该武将被下阵,且没被替换则下整
            delete ctx.team.bset.team[pos];
        }
    }

    let { buff } = await ctx.dao.north.getBuff();
    buff = buff[ctx.boss.mapid];
    let battle = new ctx.dao.c_battle({
        rid: ctx.role._id,
        type: 'north',
        player:   ctx.team.bset,
        rcards: buff
    });

    await battle.createEnemy(ctx.config.ID).save();

    ctx.body =  battle.base();
};
