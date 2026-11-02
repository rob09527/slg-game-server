'use strict';
module.exports = exports = async (ctx, next) => {
    // 设置王者演武阵容需要检查段位,kingpvp.l0 >= 5(大师以上)才可以设置第二队
    // 1,2,3 分别表示3路阵容
    const key = ctx.params.key;
    const { CONFIG } = global.gameconfig.north_fight;
    ctx.assert([1, 2, 3].includes(+key), 'invalid team key');
    const teamGuids = Object.values(ctx.request.body.battleset.team);
    const teamLength = teamGuids.filter(Boolean).length;

    ctx.assert(teamLength, 'team cant empty');

    let oldBset = ctx.bset;
    let delBset = oldBset.filter(b => b.expireAt <= Date.now());
    if (delBset.length) { // 删除过期的整容设置
        await ctx.dao.north_team.deleteMany({ rid: ctx.role.i(), _id: { $in: delBset.map(b => b._id) } });
    }

    oldBset = oldBset.filter(b => b.expireAt > Date.now());

    ctx.assert(!oldBset.find(b => b.type == key), 'already set');
    for (const s of oldBset) {
        for (const g of Object.values(s.bset.team)) {
            // 如果包含已经上阵的武将
            ctx.assert(!teamGuids.includes(g.guid), 'duplicate onset');
        }
    }
    const bset = {
        team: ctx.request.body.battleset.team,
        mythic: ctx.request.body.battleset.mythic,
        zhenfa: ctx.request.body.battleset.zhenfa
    };
    const lockBset = await ctx.role.getBattleSet(bset);
    const r = await ctx.dao.north_team.create({
        bset: lockBset,
        rid: ctx.role.i(),
        type: +key,
        vit: CONFIG.INIT_VIT || 5,
        expireAt: CONFIG.CURRENT_START_TIME + CONFIG.KEEPING * 60 * 1000, // 计算整容过期时间
        lastVitTime: Date.now(),
        create: Date.now(),
    });
    ctx.body = r;
};
