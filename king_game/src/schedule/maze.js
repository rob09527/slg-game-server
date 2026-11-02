'use strict'

exports.name = "新远征重置";
// 定时器语句
exports.cron = async function () {
    const {CONFIG} = global.gameconfig.nmaze;
    return CONFIG.REFRESH_CRON;
}

let lastFlushTime = 0;

exports.force_on_time = true; //强制锁定

/**
 * @return {Promise<void>}
 */
exports.main = async function () {

    if(Date.now() - lastFlushTime < 5000) { // 连续刷新时强制刷新远征表,方便测试后台刷远征
        await global.dao.nmaze.deleteMany({}); // 正常远征走懒刷新
    }
    // 锁定商店
    // await global.dao.c_shop.updateMany({type: 'maze'}, {$set: {lock: 1}});
    lastFlushTime = Date.now();

}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
