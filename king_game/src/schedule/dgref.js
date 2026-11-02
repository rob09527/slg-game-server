'use strict'


// 定时器
exports.name = "一骑当先重置"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
    await global.dao.c_dginfo.remove({});
    await global.dao.c_dgchapter.remove({});
    await global.dao.video.remove({type: 'dungeon'});
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
