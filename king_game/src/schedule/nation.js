'use strict';

/* 国战荣誉结算,根据排名发奖励
 */
const tg = require('./../util/textgetter');
const moment = require("moment");
const {
    CRON,
    REWARDS: RANK_REWARD
} = global.gameconfig.ring_rank || {};

exports.name = "国战-擂台积分结算"; // 只获得国战擂台积分排名奖励
// 定时器语句
exports.cron = CRON;

let lastFlushTime = 0;

exports.main = async function () {
    // 所有国战组下的groupid
    let nationwar_match = await global.dao.nationwar_match.find({}, { groupmark: 1 });
    // 只查 最近这一周在线的玩家
    const lastweek = Date.now() - 24 * 3600 * 1000 * 7;
    for (let g of nationwar_match) {
        let groupmark = g.groupmark;
        let nationwar_servers = await global.dao.nationwar_serverinfo.find({ groupmark }, { servers: 1 })
        let servers = [];
        nationwar_servers.forEach(s => {
            servers.append(s.servers);
        });
        //  同一个跨服组
        const roles = await global.dao.role.find({ 'hide.38018.count': { $gt: 0 }, update: { $gt: lastweek }, servid: { $in: servers } }, {
            _id: 1,
            uid: 1,
            rno: 1,
            servid: 1,
            'hide.38018.count': 1,
        }).sort({ 'hide.38018.count': -1 });
        console.log('SCHEDULE HONOR ROLES ', roles.length, roles.map(r => r.uid).join(','));
        let lastRewardRank = Infinity;
        const ranks = Object.keys(RANK_REWARD).sort((a, b) => b - a);

        if (roles.length) {
            // 找出 最后一名的奖励
            for (const rank of ranks) {
                if (rank < roles.length) {
                    break;
                }
                lastRewardRank = +rank;
            }
        }

        // 根据排名发放结算奖励
        for (let i = roles.length - 1; i >= 0; i--) {
            const role = roles[i];
            const rank = i + 1;
            if (RANK_REWARD[rank]) {
                lastRewardRank = rank;
            }
            const rewards = RANK_REWARD[lastRewardRank] && RANK_REWARD[lastRewardRank];
            if (rewards && rewards.length) {
                const others_rewards = rewards.filter(_ => +_.GSID !== 38019);
                const hasHONOR = role.getProp(38018); // 拥有荣耀值

                // 其他奖励通过邮件发放(无荣耀值不发放奖励
                if (hasHONOR && others_rewards.length) {

                    await global.dao.mail.create({
                        type: 2,
                        rid: role._id,
                        title: tg('HONOR_SETTLE_T'),
                        content: tg('HONOR_SETTLE_C', rank),
                        reward: others_rewards,
                    });
                }

            }
        }
    }
    // 删除国战，停止国战
    await global.dao.nationwar.deleteMany({});
    // 清除积分
    // 移除擂台阵容 
    await global.dao.role.updateMany({ 'battlearr.ringpvp1': { $exists: 1 } }, { $unset: { 'battlearr.ringpvp1': 1, 'battlearr.ringpvp2': 1, 'battlearr.ringpvp3': 1, 'hide.38018.count': 1 } }).catch(_ => null)
    await global.dao.general.updateMany({ 'battleset.ringpvp1': { $exists: 1 } }, { $unset: { 'battleset.ringpvp1': 1, 'battleset.ringpvp2': 1, 'battleset.ringpvp3': 1 } }).catch(_ => null)

    lastFlushTime = Date.now();

}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
