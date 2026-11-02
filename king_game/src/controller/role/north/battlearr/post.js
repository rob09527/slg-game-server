'use strict';
module.exports = exports = async (ctx) => {
    ctx.body = ctx.bset.filter(b => b.expireAt > Date.now());
    const { CONFIG = {PER_HOUR: 6, CAST_VIT: 1, MAX_VIT: 10} } = global.gameconfig.north_fight;

    for (const team of ctx.body) {

        team.vit = team.current_vit;

        team.max_vit = CONFIG.MAX_VIT;
        team.per_hour = CONFIG.PER_HOUR;
        await team.save();
    }
};
