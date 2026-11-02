
'use strict'

const assert = require('assert');
const ranDom = require('../../../util/random');
// 通用翻牌逻辑代码
// 前提是配置格式要一致
module.exports = exports = async function (type = '') {
    let config = global.gameconfig[`${type}rewardchallenge`];
    assert(config, 'config nexist');
    let condjudge = false;
    if (type == 'maze') {
        condjudge = this.special.bw > Date.now()
    }
    let level = this.level;
    let reward = [];
    // 等级过滤
    let pool = config.filter(({ LV: [MIN, MAX] }) => level >= MIN && level <= MAX)
    assert(pool.length > 0, 'reward err');
    let rate = pool.deepMap('W');
    for (let i = 0; i < 3; i++) {
        let { GSID, COUNT: [MIN, MAX] } = pool[ranDom.inweight(rate)];
        reward.push({ GSID, COUNT: ranDom.between(MIN, MAX) });
    }
    reward = reward.map((item, index) => {
        // 特权条件检查
        if (index == 0 || condjudge) item.real = true;
        return item;
    })
    return reward
}