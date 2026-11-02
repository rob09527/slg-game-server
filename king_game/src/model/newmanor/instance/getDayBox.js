'use strict'
const assert = require('assert');
const moment = require('moment');
// 新远征-获取每日宝箱奖励
module.exports = exports = async function () {
    let tmp = this.toJSON();
    let time = tmp.daytimes;
    let itmes = [];
    let today = moment().startOf('day').valueOf();
    // 野外难度等级要大于1级
    if (this.monsterlv <= 1) return itmes;
    const { DAY_ITEMS: dayitemsConfig = [] } = global.gameconfig.newmanor_monster[this.monsterlv] || {};
    assert(dayitemsConfig && dayitemsConfig.length > 0, 'invalid config');
    // 领取时间大于今天的0点。说明今天已领取。
    if (time > today) return itmes;
    itmes = dayitemsConfig;
    return itmes;

}
