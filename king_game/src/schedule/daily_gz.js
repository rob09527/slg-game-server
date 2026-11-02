'use strict'

const tg = require('./../util/textgetter');
exports.name = "贵族月卡结算"; // 每日定时器，负责执行 周 日 月标记刷新
// 定时器语句
exports.cron = "0 2 0 * * *";


exports.main = async function () {

    const {NAME, DAILYLIMIT, DAILYITEMS} = global.gameconfig.right.specialgz;
    const [{COUNT: ybnum}] = DAILYITEMS;
    let cond = {
        'special.gz': {$gte: 1}
    }
    let mails = await global.dao.role.find(cond, '_id special.gz');
    mails = mails.map(({_id, special}) => {
        return {
            type: 2, rid: _id,
            title: tg('YKRIGHTT', NAME),
            content: tg('YKRIGHTDAILYC', NAME, NAME, (special.gz - 1) + ""),
            reward: DAILYITEMS,
        }
    })
    let udp = {
        $inc: {'special.gz': -1},
        $set: {
            ['others.' + DAILYLIMIT]: {count: 1},
        }
    }
    await global.dao.role.updateMany(cond, udp);
    await global.dao.mail.insertMany(mails);
    console.log('GZ MAIL SEND DONE', mails.length, Date.now());
}

