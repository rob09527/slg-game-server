'use strict'

const TARGETS = [
    { pvp: { $gte: 0.9, key: 'pvpscore' } },
    { pvp: { $gte: 0.8, $lte: 1.2, key: 'pvpscore' } },
    { 'pvpdef_power': { $gte: 0.5, $lte: 0.9, key: '_powerbattleset.pvpdef' } }, // 这条必须是 pvpdef_power 结构
]

module.exports = exports = async (ctx, next) => {
    console.log('PVP TARGET ', ctx.role.uid, ctx.role.servid, new Date().format(), 'WITH FORCE:', ctx.request.body.force);
    let cache = await ctx.dao.c_pvp.findOne({ rid: ctx.role._id });
    if (cache && !ctx.request.body.force) {
        ctx.body = cache.targets;
        return;
    }
    ctx.body = [];
    const ignoreRid = {
        [ctx.role.i()]: true
    };
    for (let i = 0; i < TARGETS.length; i++) {
        const cond = TARGETS[i];
        const rankKey = Object.keys(cond)[0];
        const confCfg = cond[rankKey];
        const val = (+ctx.role.getProp(confCfg.key)) || 1000;
        const min = confCfg.$gte ? Math.floor(val * confCfg.$gte) : 0;
        const max = confCfg.$lte ? Math.floor(val * confCfg.$lte) : undefined;
        console.log('min====>', min, 'max=====>', max);
        const rankService = new global.services.RankService(rankKey, ctx.role._gameserv.groupid);
        let arr = await rankService.itemsByScore(min, max, 0, Math.floor(100 + Math.random() * 100));
        if (arr.length < 1) { // 如果 积分榜没有人 按战斗力匹配
            const powerCond = TARGETS[2].pvpdef_power;
            const val = (+ctx.role.getProp(powerCond.key)) || 10;
            const min = powerCond.$gte ? Math.floor(val * powerCond.$gte) : 0;
            const max = powerCond.$lte ? Math.floor(val * powerCond.$lte) : undefined;
            const rankService = new global.services.RankService('pvpdef_power', ctx.role._gameserv.groupid);
            arr = await rankService.itemsByScore(min, max, 0, Math.floor(100 + Math.random() * 100));
        }
        arr = arr.filter(id => !ignoreRid[id]); // 过滤已经匹配到的
        if (arr.length > 0) {
            const id = arr[ctx.random.between(0, arr.length - 1)];
            ignoreRid[id] = true;
            ctx.body.push(id);
        } else {
            if (i === 2) {	// 战力匹配
                let $gte = ctx.role._powerbattleset.pvpdef * Object.values(cond)[0].$gte;
                let $lte = ctx.role._powerbattleset.pvpdef * Object.values(cond)[0].$lte;
                let robots = global.gameconfig.robotpvp.filter(({ POWER }) => {
                    return POWER >= $gte && POWER <= $lte;
                })
                if (robots.length > 0) {
                    const robotId = 'robot_' + robots[0].ID;
                    ctx.body.push(robotId);
                    continue;
                }
            }

            let pool = global.gameconfig.robotpvp.filter(({ ID }) => {
                // 排除逻辑
                return true;
            })
            let robot = pool[ctx.random.between(0, pool.length - 1)];
            // 构造相同结构数据
            const robotId = 'robot_' + robot.ID;
            ctx.body.push(robotId);
        }

    }
    await ctx.dao.c_pvp.findOneAndUpdate({ rid: ctx.role.i() }, { $set: { targets: ctx.body } }, {
        upsert: true
    })
}
