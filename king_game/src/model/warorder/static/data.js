"use strict";

module.exports = function(rid, cycle = 1) {
    const {
        CDDAY,          // 持续天数
        PRICE: price,   // 战令价格
        EXP: exp,       // 购买战令所得VIP经验
        CHARGEREWARD,   // 购买战令所得奖励
        LEVELCOST,      // 购买等级所消耗
        LEVELGET,       // 购买等级所获得战令经验
        WDLEVEL,        // 战令奖励
    } = global.gameconfig.warorder || {};
    if (!CDDAY) return null;
    const start = Date.now();;
    const end = start + CDDAY * 24 * 3600000;
    const totalCycle = new Set(WDLEVEL.map(({ ID }) => ID)).size;
    const id = (cycle - 1) % totalCycle + 1;
    const wdlevel = WDLEVEL.filter(({ ID }) => ID == id)
        .map(({
            LEVEL: level, NREWARD: nrw, HREWARD: hrw,
        }) => ({
            level, nrw, hrw,
        }));
    const data = {
        rid, start, end,
        charge: {
            price, exp,
            reward: CHARGEREWARD,
        },
        levelbuy: {
            get: LEVELGET,
            cost: LEVELCOST,
        },
        wdlevel,
    }
    return data;
}