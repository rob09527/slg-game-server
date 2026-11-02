'use strict'

const tg = require('./../util/textgetter');

// 定时器
exports.name = "整点刷新国王赏赐"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句
exports.cron = "3 0 * * *";

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
    // 每日税收
    let kingdoms = await global.dao.c_kingdom.find({}, { groupid: 1, standings: 1 });
    if (kingdoms.length == 0) return
    let mails = [];
    for (let kingdom of kingdoms) {
        let _standings = kingdom.standings;
        let groupid = kingdom.groupid;
        for (let [i, rid] of Object.entries(_standings)) {
            let config = global.gameconfig.kingdomright[i];
            if (!config) break;
            mails.push({
                type: 2,
                rid,
                title: tg('WANGPVP_DAILYREWARD_T'),
                content: tg('WANGPVP_DAILYREWARD_C', config.NAME),
                reward: config.DAILYREWARDS,
            })
        }
        let $set = {
            'pregift.rewards': [],
            'pregift.refcount': 0,
        }
        let $unset = {
            'pregift.is_send': 1
        }
        await global.dao.c_kingdom.update({ groupid }, { $unset, $set });
        //TODO 更新缓存
    }
    if (mails.length > 0) global.dao.mail.insertMany(mails).catch(console.error);
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
