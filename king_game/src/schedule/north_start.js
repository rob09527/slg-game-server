'use strict'

const textgetter = require('../util/textgetter');

// 定时器
exports.name = "北伐开始";

exports.cron = async function () {
    const {CONFIG} = global.gameconfig.north_fight;
    return CONFIG.START;
}

/**
 * 定时器主体函数
 * @return {Promise<void>}
 */
exports.main = async function () {
    await global.dao.north_rank.deleteMany({state: true});     // 开始新的周期，删除排行榜
    await global.dao.north.deleteMany({}); // 开始时 删除 boss
}

