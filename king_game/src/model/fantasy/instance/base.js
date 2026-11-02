
'use strict'

const assert = require('assert');
const moment = require('moment');

module.exports = exports = function () {

    const { BOSS, CONFIG } = global.gameconfig.fantasy;
    assert(BOSS, 'invalid boss config');

    const bossConfig = BOSS[this.bossidx];
    assert(bossConfig, 'invalid boss info');

    let expireAt = moment(this.startAt).add(+bossConfig.HOURS - CONFIG.GAP, 'h').valueOf();// 提前一个小时关闭入口
    return {
        ...bossConfig,
        bossidx: this.bossidx,
        bossid: this.bossid,
        nextidx: this.nextidx,
        startAt: this.startAt,
        create: this.create,
        expireAt,
        nextBossTime: expireAt + (CONFIG.GAP * 60 * 60 * 1000)
    }
}
