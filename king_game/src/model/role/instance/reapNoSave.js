'use strict'

const assert = require('assert');

const random = require('./../../../util/random');
const INTERVAL = 5000;

/**
 * @param reaptime {number} 固定征收时间，单位毫秒，不传递按照上次征收时间计算时间
 * @param isKZ {boolean} 是否为快战收益
 * @type {function(*=): []}
 */
module.exports = exports = function (reaptime = 0, isKZ = false) {
    const config = global.gameconfig.chapter[this.maxmapid];
    assert(config, 'invalid mapid');

    let {items = [], times = 0, vip_ex} = this.reapRewardNoSave(reaptime);

    this.lastreap += times * INTERVAL;
    this.lastreap = Math.max(this.lastreap, Date.now());


    // 活动挂机掉落的起点不能早于开始时间

    for (let i = 0; i < times; i++) {
        for (let drop of config.DROPS) {
            if (!random.hit(drop.CHANCE, 10000)) continue;
            let COUNT = drop.COUNT;
            if (vip_ex.gsidEx.ALL){
                COUNT = Math.floor( COUNT * (1 + vip_ex.gsidEx.ALL/1000) );
            }
            items.push({GSID: drop.GSID, COUNT  });
        }

    }

    // 挂机掉落
    // let [start, end] = global.config.ZHD.GJDL || [];
    // if(Date.in(start, end)) {
    //     let actimes = isKZ ? times : Math.min(Math.floor((Date.now() - new Date(start).getTime() )/5000), times);
    //     const boomItems = global.gameconfig.chapter_cjgjdl[this.maxmapid];
    //     for (let i = 0; i < actimes; i++) {
    //         // 挂机活动掉落
    //         for (let item of boomItems) {
    //             if (!random.hit(item.CHANCE, 10000)) continue;
    //             items.push({GSID: item.GSID, COUNT: item.COUNT});
    //         }
    //     }
    // }

    items = items.arrange();

    return items;
}
