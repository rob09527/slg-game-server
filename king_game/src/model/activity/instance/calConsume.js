'use strict';
const moment = require('moment');
const IF = (bl, a, b) => {
    return bl ? a : b;
};
const RANDOM = (min, max) => {
    return Math.floor(min + Math.random() * (max - min));
};
/**
 * 计算消耗
 * @type {function(*=, *=, *=): boolean}
 */
module.exports = exports = function (role, itemID, type = 'reward') {

    let rewardObj;
    if (!this.params[type]) {
        return false;
    }
    const info = role.act[this.type];
    let times = 0; // 累积抽取次数
    if (itemID) {
        rewardObj = this.params[type][itemID];
        times = info && info[itemID] ? info[itemID].times : 0;
    } else {
        rewardObj = this.params[type];
        if(type === 'lucky') {
            times = info && info.lucky ? info.lucky.times : 0;
        } else {
            times = info && info.times ? info.times : 0;
        }
    }
    if (!rewardObj) { // 没有奖励配置返回 false
        return false;
    }
    if (!rewardObj.consume || rewardObj.consume.length === 0) {
        // 没有消耗直接返回 true
        return false;
    }
    return rewardObj.consume.map(c => {
        const GSID = c.GSID;
        let COUNT = c.COUNT;
        if (c.COUNT && isNaN(c.COUNT)) {
            c.COUNT_FN = c.COUNT_FN || new Function('role', 'moment', 'IF', 'RANDOM', 'start', 'etime', 'times', `return ` + c.COUNT);
            COUNT = c.COUNT_FN(role, moment, IF, RANDOM, this.start, this.etime, times);
        }
        COUNT = +COUNT;
        return {
            GSID,
            COUNT,
        };
    }).filter(c => c.COUNT > 0);
};
