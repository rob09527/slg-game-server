'use strict'
const tg = require('./../util/textgetter');
const random = require('./../util/random');

// 定时器
exports.name = "轮询游街数据"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句
exports.cron = "*/5 * * * *";

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
    let kingdoms = await global.dao.c_kingdom.find({}, { _id: 1, shames: 1 });
    if (kingdoms.length == 0) return;
    let mails = [];
    for (let kingdom of kingdoms) {
        let shames = kingdom.shames;
        let $in = [];
        let rids = [];
        for (let { _id, endtime, rewardtime, rid } of shames) {
            // 已发送奖励 或 结束时间未到
            if (rewardtime || endtime > Date.now()) continue;
            $in.push(_id);
            rids.push(rid);
        }
        if (rids.length < 1) return;
        for (let rid of rids) {
            let role = await global.dao.role.findOne({ _id: rid }, { hide: 1 });
            if (!role) continue;
            let reward = global.gameconfig.kingdom.SHAME_REWARD.map(item => {
                let {
                    GSID,
                    MINCOUNT,
                    MAXCOUNT,
                    LVR,
                } = item;
                let COUNT = Math.floor(random.between(MINCOUNT, MAXCOUNT) + role.level * LVR);
                return {
                    GSID,
                    COUNT,
                }
            })
            mails.push({
                type: 2, rid,
                title: tg('WANGPVP_YOUJIE_ENDT'),
                content: tg('WANGPVP_YOUJIE_ENDC'),
                reward,
            })
        }
        for (let shame of shames) {
            if (rids.includes(shame.rid)) shame.rewardtime = Date.now();
        }
        await global.dao.c_kingdom.updateOne({ _id: kingdom._id }, { $set: { 'shames': shames } });
        //TODO 更新缓存
    }
    await global.dao.mail.insertMany(mails);

}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
