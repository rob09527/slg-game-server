'use strict'


// 定时器
exports.name = "移除王宫数据"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句
exports.cron = "58 23 * * 4";

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
   await global.dao.c_kingdom.deleteMany({}).catch(console.error);
   //TODO 清除缓存
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
