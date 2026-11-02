'use strict'
const moment = require("moment");


// 定时器
exports.name = "超值基金重置"; // 类似一句中文注释，后续后台可以展示该名字,
// 定时器语句
exports.cron = "1 0 0 * * *";

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
    const {LIMITHOUR, CDD, FUND, GETDAY} = global.gameconfig.worthfund;
    const {WORTHFUND_T: MTITLE, WORTHFUND_C: MCONTENT} = global.gameconfig.text;
    let now = Date.now();
    // 重置超值基金
    now = moment(now).startOf("day").valueOf();
    let lend = now + LIMITHOUR * 3600 * 1000;
    let tnext = moment(lend).startOf("day").valueOf() + CDD * 24 * 3600 * 1000;
    let _ = await global.dao.c_worthfund.updateMany({tnext: {$lte: now + 1000, $exists: 1}}, {
        $set: {
            lstart: now,
            lend, tnext,
            day: 0,
        },
    })
    console.log('SCHEDULEREF worthfref reset', _.nModified, new Date().toLocaleString())
    // 发放每日基金奖励邮件
    let cursor = global.dao.c_worthfund.find({
        fend: {$gte: now, $exists: 1},
        day: {$lt: GETDAY, $exists: 1},
    }, {_id: 0, day: 1, rid: 1, fund: 1}).cursor();
    let worth = await cursor.next();
    let mails = [];
    while (worth) {
        let reward = [];
        for (let [price] of Object.entries(worth.fund)) {
            let oneFund = FUND.find(({PRICE}) => PRICE == price);
            if (!oneFund) continue;
            reward.push(...oneFund.ITEMS[worth.cycle()][worth.day].REWARD);
        }
        reward = reward.arrange();
        if (reward.length > 0) mails.push({
            rid: worth.rid, type: 2,
            title: MTITLE, content: MCONTENT,
            reward,
        })
        await global.dao.c_worthfund.updateOne({rid: worth.rid}, {$inc: {day: 1}});
        worth = await cursor.next();
    }
    console.log('SCHEDULEREF worthfref select done', new Date().toLocaleString())
    if (mails.length > 0) await global.dao.mail.insertMany(mails);
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}

