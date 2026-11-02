
'use strict'

const tg = require('./../util/textgetter');
exports.name = "超级月卡结算"; // 每日定时器，负责执行 周 日 月标记刷新
const cursorUtil = require('../util/cursor');

// 定时器语句
exports.cron = "0 2 0 * * *";

exports.main = async function () {

    const {NAME, DAILYLIMIT, DAILYITEMS} = global.gameconfig.right.specialzz;
    const [{COUNT: ybnum}] = DAILYITEMS;
    let cond = {
        'special.zz': {$gte: 1}
    }

    const mails = [];
    await cursorUtil(global.dao.role.find(cond, '_id special.zz hide.38003.count'), async (role)=> {
        const {_id, special} = role;
        mails.push({
            type: 2, rid: _id,
            title: tg('YKRIGHTT', NAME),
            content: tg('YKRIGHTDAILYC', NAME, NAME, (special.zz - 1) + ""),
            reward: DAILYITEMS,
        });
        // mails.push({
        //     type: 2, rid: _id,
        //     title: tg('ZZRIGHTDAILYVIPT'),
        //     content: tg('ZZRIGHTDAILYVIPC', role.vip+'', (special.zz - 1) + ""),
        //     reward: global.gameconfig.vip.VIPDAILY[role.vip],
        // });
        if(mails.length > 1000) {
            await global.dao.mail.insertMany(mails);
            mails.splice(0, mails.length);
        }
    })
    if(mails.length > 0) {
        await global.dao.mail.insertMany(mails);
    }
    let udp = {
        $inc: {'special.zz': -1},
        $set: {
            ['others.'+DAILYLIMIT]: {count: 1},
        }
    }
    let ret = await global.dao.role.updateMany(cond, udp);


    console.log('ZZ MAIL SEND DONE', mails.length, Date.now(), ret);
}
