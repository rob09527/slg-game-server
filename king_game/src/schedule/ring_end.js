'use strict'

const moment = require('moment');
const { CONFIG } = global.gameconfig.ring_rank;

exports.name = "国战擂台-结束";
// 定时器语句
exports.cron = CONFIG.END;

let lastFlushTime = 0;
/**
 * @return {Promise<void>}
 */
exports.main = async function () {
    // 结算锁住 擂台
    await global.dao.ringrank.updateMany({}, { $set: { state: 1 } });

    const rankList = await global.dao.ringrank.find({ robot_id: { $exists: false } }, {
        'role.servid': 1,
        rid: 1,
        honor_pool: 1,
        rank: 1,
        last_honor_time: 1
    });
    const sidMap = {};
    // 发放荣誉值
    for (const item of rankList) {
        const honor = await item.clearHonor(); // 清空并获得需要结算的荣耀值
        sidMap[item.role.servid] = 1; // 记录所有服务器id
        //
        if (honor) {
            // 直接发放未结算的荣誉值
            await global.dao.role.updateOne({ _id: item.rid }, {
                $inc: {
                    'hide.38018.count': honor
                }
            })

        }
    }
    
    // 移除擂台阵容 
    await global.dao.role.updateMany({}, { $unset: { 'battlearr.ringpvp1': 1, 'battlearr.ringpvp2': 1, 'battlearr.ringpvp3': 1 } }).catch(_ => null)
    await global.dao.general.updateMany({}, { $unset: { 'battleset.ringpvp1': 1, 'battleset.ringpvp2': 1, 'battleset.ringpvp3': 1 } }).catch(_ => null)

    lastFlushTime = Date.now();
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}