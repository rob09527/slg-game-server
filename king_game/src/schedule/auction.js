'use strict'


// 定时器
exports.name = "拍卖行定时器";

exports.cron = async function () {
    const allAuc = await global.dao.auction.find({
        bounced: false  // 查出全部未分红的拍卖品
    }, {
        expireAt: 1
    }).sort({
        expireAt: 1
    }); // 查出全部未售出的拍品

    const crons = [];
    let crontime = 0;
    for (let auc of allAuc) { //
        let expireAt = auc.expireAt;
        if (auc.expireAt < Date.now()) { // 在服务器重启的过程中，拍品已经结束了
            expireAt = Date.now();
        }
        expireAt += 1000 * 60 * 5;
        if (expireAt - crontime > 900000) { // 相近15分钟之内的拍卖品，可以共用一个定时器,超过 15分钟的就启新的定时器
            crontime = expireAt;
            crons.push(crontime);
        } else {
            // 一分钟过后进行定时器操作
            crontime = expireAt;
            crons[crons.length - 1] = crontime;
        }
    }
    return crons;
}

/**
 * 定时器主体函数
 * @return {Promise<void>}
 */
exports.main = async function () {
    await global.dao.auction.finishTask();
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
