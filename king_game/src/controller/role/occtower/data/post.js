
'use strict'
// 职业试炼-战斗信息
const occtowerConfig = global.gameconfig.occtower.TOWERINFO;
const occtowerBOSS = global.gameconfig.battleocctower;
module.exports = exports = async (ctx, next) => {
    let { type, farm } = ctx.request.body;
    ctx.assert(type >= 1, 'invalid type');
    // 查玩家职业塔信息
    let towerInfo = await ctx.dao.tower.findOne({ rid: ctx.role._id, occu: type, type: 'occutower' }, { record: 1 });
    let bossId = 0;
    let config;
    if (towerInfo) {
        let recordNum = towerInfo.record.length;
        config = occtowerConfig[type][recordNum];
        if (farm) {
            // 扫荡的话就是前一关
            config = occtowerConfig[type][recordNum - 1];
        }
        ctx.assert(config, 'invalid config');
        bossId = config.ID;
    } else {
        // 第一关
        config = occtowerConfig[type][0];
        ctx.assert(config, 'invalid config first');
        bossId = config.ID;
    }
    ctx.body = occtowerBOSS[bossId];
}