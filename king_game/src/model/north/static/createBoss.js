'use strict';

const random = require('./../../../util/random');

// 获取当前关卡的 boss列表
module.exports = async function (mapid, groupid) {


    const {CONFIG, MAP, BOSS_SKU} = global.gameconfig.north_fight;


    const cfg = MAP[mapid]; //
    assert(cfg, 'invalid mapid');
    // 战利品数量
    const aucCount = random.between(cfg.AUC_MIN, cfg.AUC_MAX);

    let aucMap = {};
    if (aucCount) {
        // 把战利品分配到前2,3,4 位置
        const aucPoints = random.fpool([2, 3, 4].map(i => ({point: i, WEIGHT: 1})), aucCount);
        for (const auc of aucPoints) {
            aucMap[auc.point] = cfg.AUC_SKU;
        }
    }
    // 0，1 位置的boss 固定分配一个战利品
    const _aucPoints = random.fpool([0,1].map(i => ({point: i, WEIGHT: 1})), 1);
    for (const auc of _aucPoints) {
        aucMap[auc.point] = cfg.AUC_SKU3;
    }

    const bosses = [];
    const now = Date.now();
    // boss 过期时间按本次结算时间延后一天
    const expireAt = CONFIG.SETTLEMENTTIME +  25 * 60 * 1000; // 24 * 60 * 60 * 1000

    for (let  k = 0; k < cfg.POINT.length ; k++) {
        const c = cfg.POINT[k];
        const bossPool = Object.values(BOSS_SKU).filter(b => b.SKU_ID === c.ID);
        if (bossPool.length === 0){
            console.error('north boss pool', c.ID, 'is empty');
            continue ;
        }
        const boss = random.fpool(bossPool, 1, 'CHANGE')[0];

        if (c.RATE && Math.random() > c.RATE){ // 概率出现的怪物
            continue;
        }
        let auction = aucMap[k];

        if (c.AUC_RATE && Math.random() <= c.AUC_RATE){
            // 独立的 战利品掉落概率
            auction = c.AUC_SKU;
        }
        let etime = 0;
        if (boss.RUN_OUT){
            etime = now + boss.RUN_OUT * 60 * 1000;
        }
        bosses.push({
            bossid: boss.ID,
            point: k,
            mapid,
            groupid,
            auction: auction,
            totaldamge: 0,
            etime,
            expireAt,
            lastdamge: {}
        });
    }
    const r = await this.create(bosses);
    return r;
};
