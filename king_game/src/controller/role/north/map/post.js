'use strict';

module.exports = exports = async (ctx, next) => {
    const groupid = ctx.role._gameserv.groupid;
    const bosses = await ctx.dao.north.getMapBosses(groupid);
    const {BOSS_SKU, BOSS_NAME, MAP } = global.gameconfig.north_fight;

    let { buff } = await ctx.dao.north.getBuff();

    const curlevel = bosses[0] ? bosses[0].mapid : 0;
    buff = buff[curlevel];
    const _killboss = await ctx.dao.north.aggregate([
        {
            $match: {groupid, expireAt: {$gte: Date.now()} , kill: {$exists: true} }
        },
        {
            $group: {
                _id: "$point",
                count: {
                    $sum: 1
                }
            }
        }
    ]);
    const killboss = _killboss.map(b => ({point: b._id, killcount: b.count}));
    if (!bosses.length){ // 通关了
        return ctx.body = {
            curlevel: await ctx.dao.north.getLastMapId(),
            buff,
            killboss,
            ispass: 1,
            bosses
        }
    }
    const owner = ctx.role.i();
    const auctionPools = global.gameconfig.auction.POOL;
    ctx.body = {
        bosses: bosses.map(b => {
            b = b.toJSON();
            if (!BOSS_SKU[b.bossid]) {
                console.warn('MISS BOSS CONFIG', b.bossid);
                return b;
            }
            // 读取战利品池子
            const MAP_CFG = MAP[b.mapid];
            let aucSku = 0;
            if (b.point === 0 || b.point === 1){
                aucSku = MAP_CFG.AUC_SKU3;
            } else if (b.point < 5){
                aucSku = MAP_CFG.AUC_SKU;
            }

            if (MAP_CFG.POINT[b.point].AUC_SKU){
                aucSku = MAP_CFG.POINT[b.point].AUC_SKU
            }

            let auction_pool = []; // 战利品池子
            if (aucSku){
                const set = new Set(auctionPools.filter(a => a.POOL == aucSku).map(a => a.GSID0));
                auction_pool = [...set];
            }

            const cfg = BOSS_SKU[b.bossid];
            const maxhp = cfg.BOSSHP;
            const name = BOSS_NAME[b.point] ;
            const imageid = cfg.GENERAL;


            return {...b,imageid,auction_pool, name,lastdamge: b.lastdamge && b.lastdamge[owner] ? b.lastdamge[owner]: {}  , rewards: cfg.REWARDS || [], maxhp: maxhp, nowhp: Math.max(maxhp - b.totaldamge, 0)};
        }),
        killboss,
        curlevel,
        buff,
    };
};
