'use strict'

const textgetter = require('../util/textgetter');

// 定时器
exports.name = "北伐结算";

exports.cron = async function () {
    const {CONFIG} = global.gameconfig.north_fight;
    return CONFIG.END;
}

/**
 * 定时器主体函数
 * @return {Promise<void>}
 */
exports.main = async function () {
    const {RANK_REWARD} = global.gameconfig.north_fight;

    // 删除已经发放的记录，按逻辑是上周的排行
    await global.dao.north_rank.deleteMany({state: true});

    const serv_groups = await global.dao.gameserver.fetchServers();

    for (const group of serv_groups) {
        const groupid = group._id;
        console.log('SCHEDULE NORTH_RANK START AT GROUP_ID', groupid, new Date().format());
        const killrewards = await global.dao.north.getKillReward(groupid);
        const lastMapId = await global.dao.north.getLastMapId(groupid);
        // 按需获取 数据
        const rank = await global.dao.north_rank.find({groupid: +groupid, state: false}).sort({totaldamge: -1});

        const mails = [];
        for (let i = 0; i < rank.length; i++) {
            const one = rank[i];
            if (killrewards && killrewards.length) {
                // 击杀累计奖励
                mails.push({
                    type: 2,
                    rid: one.rid,
                    reward: killrewards,
                    title: textgetter('NORTH_KILL_T',),
                    content: textgetter('NORTH_KILL_C', lastMapId),
                });
            }
            // 排名奖励
            for (const rewardCfg of RANK_REWARD) {
                if (i < rewardCfg.RANK) {
                    mails.push({
                        type: 2,
                        rid: one.rid,
                        reward: rewardCfg.ITEMS,
                        title: textgetter('NORTH_RANK_T'),
                        content: textgetter('NORTH_RANK_C', i + 1),
                    });
                    break;
                }
            }
        }
        console.log('MAILS', mails);
        await global.dao.mail.insertMany(mails);
        await global.dao.north_rank.updateMany({groupid: +groupid, state: false}, {$set: {state: true}});

        const auctionNorthObj = await global.dao.auction.find({
            auctioneer: 'north',
            groupid,
            expireAt: {$gt: Date.now() - global.gameconfig.auction.NORTH.EXT_TIME * 1000}
        }).sort({expireAt: -1}).limit(1);
        const a = auctionNorthObj[0] || {start: 0, expireAt: 0};
        // 通知客户端北伐拍卖展示
        global.remote.pushClientAll(groupid, {
            type: 'north_auction', //
            content: {
                start: a.start,
                etime: a.expireAt
            }
        });
        // 分红标记, 所有参加北伐的都有分红资格
        await global.dao.auction.updateMany({auctioneer: 'north', groupid: +groupid, start: {$gt: Date.now()}}, {
            $set: {
                bounceList: rank.map(r => r.rid)
            }
        });
        console.log('SCHEDULE NORTH_RANK FINISH AT GROUP_ID', groupid, new Date().format());
    }

}

