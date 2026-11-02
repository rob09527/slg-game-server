'use strict'


// 定时器
exports.name = "王者演武清空积分榜"; // 类似一句中文注释，后续后台可以展示该名字,

exports.cron = '58 7 * * 5'; // 每周五8点开始，提前2分钟清理数据
//exports.cron = '20 18 * * 5'; // 每周五8点开始，提前2分钟清理数据 dev

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
    // 清空redis缓存
    await global.services.RankService.clearPatten('pvpstage', '*');
    await global.dao.pvpking.remove({});
}
/**
     * 结果检测函数 (可以不设置检测函数)
     * @return {Promise<boolean>}
     */
exports.check = async function () {
    return true;
}