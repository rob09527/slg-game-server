'use strict'


// 定时器
exports.name = "单人演武结算-日结算与赛季结算"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句
exports.cron = "0 23 * * *";

//exports.cron = "0/20 * * * * ?";

const creator = require('./../util/pvpreward_promise_creator');

exports.main = async function () {
    creator().catch(console.error);
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}