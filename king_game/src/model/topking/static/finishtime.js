'use strict'

/*
  计算未来最近一个游戏年秋季结束时间
*/


const moment = require('moment');
const ms = require('ms');

// 每一游戏季节时长(单位: 天)
const CYCLE_SEASON_DAY = 7;
// 每一游戏年时长(单位: 游戏季节)
const CYCLE_YEAR_SEASON = 4;

function v2() {
    // 自动计算下次结算结算时间
    let {
        GAMETIMESTAR = "2019-11-01 00:00",
    } = global.gameconfig.topkingconfig || {};
    GAMETIMESTAR = moment(GAMETIMESTAR).valueOf();
    GAMETIMESTAR += 3 * ms(`${CYCLE_SEASON_DAY}days`);
    let del = Date.now() - GAMETIMESTAR;
    let del_abs = Math.abs(del);
    let cycle_total_ms = ms(`${CYCLE_SEASON_DAY * CYCLE_YEAR_SEASON}days`);
    let cycle_num = 0;
    while (del_abs >= cycle_total_ms) {
        cycle_num++;
        del_abs -= cycle_total_ms;
    }
    cycle_num++; // 本周期结束时间
    let cron = GAMETIMESTAR + cycle_num * cycle_total_ms;
    return cron;
}

/**
 * 巅峰赛战斗
 * @return {number}
 */
module.exports = function () {

    let v2time = v2();
    let pretime = v2() - ms(`28days`);
    let cron = v2time - ms(`21days`) > Date.now() ? pretime:v2time;
    console.error('new:',v2time,'pretime',pretime,'time',cron);

    // 判断这个活动是否开启,如果未开启则时间设置为过去时间
    let { START = 0 } = global.gameconfig.topkingpvp || {};
    if (!START) {
        // 2019-10-26 00:00:00
        // 过期时间
        cron = 1572019200000;
    }
    return cron
}
