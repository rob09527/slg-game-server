'use strict';

module.exports = exports = async (ctx, next) => {
    let {point, mapid , teamno: type} = ctx.request.body;

    const groupid = ctx.role._gameserv.groupid;
    ctx.boss = await ctx.dao.north.findOne({groupid, point, mapid});
    ctx.assert(ctx.boss, 'boss not exists');
    ctx.assert(!ctx.boss.etime || ctx.boss.etime > Date.now(), 'boss run'); // boss 逃跑了
    const { BOSS_SKU, CONFIG = {PER_HOUR: 6, CAST_VIT: 1} } = global.gameconfig.north_fight;
    ctx.config = BOSS_SKU[ctx.boss.bossid];
    ctx.assert(ctx.config, 'miss config for north boss ' + ctx.boss.bossid);
    ctx.assert( ctx.boss.totaldamge <  ctx.config.BOSSHP, 'boss is killed');
    if (!ctx.path.endsWith("/data") ){
        // 获取 敌方阵容 去掉队伍验证
        const team = await ctx.dao.north_team.findOne({
            rid: ctx.role.i(),
            type,
        });

        ctx.assert(team, 'no team');

        team.vit = team.current_vit; // 计算体力
        ctx.team = team;
    }


    await next();
};
