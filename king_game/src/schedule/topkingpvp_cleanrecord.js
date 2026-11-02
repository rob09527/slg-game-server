'use strict'

const ms = require('ms');
const moment = require('moment');
// 定时器
exports.name = "巅峰赛清理上一期记录";

let endDay;
exports.cron = async function () {
    let cron = global.dao.topking.finishtime();
    cron += ms('21h');
    endDay = cron + ms('7d');
    // 周五21点
    return cron;
}

/**
 * @return {Promise<void>}
 */
exports.main = async function () {
    // 判断当前时间是否已经过期
    if (Date.now() > endDay) {
        console.error('TOPKINGPVP CLEAN DATA NO IN THIS TIME');
        return
    }
    let time = moment().weekday(1).startOf('days').valueOf()
    // 清空上个赛季冠军赛的记录
    // 条件限定在本周第一天之前（本周的周四前清理都可以）。因为每周有单人演武赛季结算，但是巅峰赛只打一周
    await global.dao.topking.deleteMany({ create: { $lte: time } }); // 冠军赛王者相关信息
    await global.dao.topkingrecord.deleteMany({}); // 冠军赛记录
    await global.dao.lottery.deleteMany({}); // 冠军赛竞猜
    await global.dao.lotterybattle.deleteMany({});// 冠军赛竞猜
    await global.dao.video.deleteMany({ type: "topkingpvp" });// 冠军赛录像
    await global.dao.topkingmail.deleteMany({}); // 冠军赛邮件记录
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
