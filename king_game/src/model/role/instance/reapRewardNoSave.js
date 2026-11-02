'use strict'

const assert = require('assert');
const bseason = require('./../../../util/battleseason');

const INTERVAL = 5000;

/**
 * 征收计算 (不计算季节加成，包含VIP加成
 * @param time {number} 时间，单位毫秒,默认根据挂机时间
 * @return {{
 *     items: [{GSID:number,COUNT:number}],
 *     times: number,
 * }}
 */
module.exports = exports = function (time = 0) {
    const config = global.gameconfig.chapter[this.maxmapid];
    assert(config, 'invalid mapid');

    const {HANG} = global.gameconfig.vip;
    const vip = this.vip;
    const {TIME_HOUR , ...GSID_HANG } = HANG;
    const vip_ex = {
        gsidEx: {}
    }

    for (let k in GSID_HANG){
        vip_ex.gsidEx[k] = GSID_HANG[k][vip];
    }

    let times = Math.floor(time / INTERVAL);
    let items = [];

    // 皇宫加成
    const kingdomConfig = global.gameconfig.kingdomright[this._kingdom_rank];
    if (kingdomConfig) {
        for (let {ID, VALS: [VAL]} of kingdomConfig.RIGHTS) {
            if (ID !== 1) continue;
            vip_ex.gsidEx[30001] = vip_ex.gsidEx[30001] || 0;
            vip_ex.gsidEx[38006] = vip_ex.gsidEx[38006] || 0;
            vip_ex.gsidEx[30001] += VAL * 10; // 转为 1000分位
            vip_ex.gsidEx[38006] += VAL * 10; // 转为 1000分位
        }
    }

    for (let item of config.ITEMS) {
        let count = item.COUNT * times;
        let ex = vip_ex.gsidEx[item.GSID] || 0;
        if (vip_ex.gsidEx.ALL){
            ex += vip_ex.gsidEx.ALL;
        }
        if (ex){
            count = Math.floor(count * (1 + ex / 1000));
        }
        if (count > 0) items.push({GSID: item.GSID, COUNT: count});
    }

    return {items, times, vip_ex};
}
