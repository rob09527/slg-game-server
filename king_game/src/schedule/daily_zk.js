'use strict'

const tg = require('./../util/textgetter');
exports.name = "周卡结算"; // 每日定时器，负责执行 周 日 月标记刷新
// 定时器语句
exports.cron = "5 0 0 * * *";
// exports.cron = "*/10 * * * * *"; //测试


exports.main = async function () {

    const {NAME, DAILYLIMIT, DAILYITEMS} = global.gameconfig.right.specialzk;
    const [{COUNT: ybnum}] = DAILYITEMS;
    let cond = {
        'special.zk': {$gte: 1}
    }
    let mails = await global.dao.role.find(cond, '_id special.zk');
    mails = mails.map(({_id, special}) => {
        return {
            type: 2, rid: _id,
            title: tg('ZKRIGHT', NAME),
            content: tg('ZKRIGHTDAILYC', NAME, NAME, (special.zk - 1) + ""),
            reward: DAILYITEMS,
        }
    })
    let udp = {
        $inc: {'special.zk': -1},
        $set: {
            ['others.' + DAILYLIMIT]: {count: 1},
        }
    }
    await global.dao.role.updateMany(cond, udp);
    await global.dao.mail.insertMany(mails);
    console.log('ZK MAIL SEND DONE', mails.length, Date.now());
}

