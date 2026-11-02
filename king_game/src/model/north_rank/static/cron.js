'use strict';
const textgetter = require('../../../util/textgetter');
const moment = require('moment');
/**
 *  北伐结束结算定时器, 定时器需特殊处理
 */
module.exports = exports = async function (loadtask) {
    const {CONFIG, RANK_REWARD} = global.gameconfig.north_fight;
    const fn = async () => {
        console.error('DISPATH NORTH REWARD CRON', moment().format('YYYY-MM-DD HH:mm:ss'));
        // 删除已经发放的记录，按逻辑是上周的排行
        await this.deleteMany({state: true});

        const killrewards = await global.dao.north.getKillReward();
        const lastMapId = await global.dao.north.getLastMapId();
        // 按需获取 数据
        const rank = await this.find({state: false}).sort({totaldamge: -1});
        const mails = [];
        for (let i = 0; i < rank.length; i++) {
            const one = rank[i];
            if (killrewards && killrewards.length) {
                // 击杀累计奖励
                mails.push({
                    type: 2,
                    rid: one.rid,
                    reward: killrewards,
                    title: textgetter('NORTH_KILL_T', ),
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
        await global.dao.mail.insertMany(mails);
        await this.updateMany({state: false}, {$set: {state: true}});

        const auctionNorthObj = await global.dao.auction.find({auctioneer: 'north', expireAt: {$gt: Date.now() - global.gameconfig.auction.NORTH.EXT_TIME * 1000} }).sort({expireAt: -1}).limit(1);
        const a = auctionNorthObj[0] || {start: 0 , expireAt: 0};
        // 通知客户端北伐拍卖展示
        pushClientAll({
            type: 'north_auction', //
            content: {
                start: a.start,
                etime: a.expireAt
            }
        });
        // 分红标记, 所有参加北伐的都有分红资格
        const r = await global.dao.auction.updateMany({auctioneer: 'north', start: {$gt: Date.now()}}, {
            $set: {
                bounceList: rank.map(r => r.rid)
            }
        });
        console.error('DISPATH NORTH REWARD CRON FINISHED', moment().format('YYYY-MM-DD HH:mm:ss'), r);
    };
    loadtask({
            cron: CONFIG.END,
            fn,
        },
    );

    loadtask({
            cron: CONFIG.START,
            fn: async ()=>{
                // 开始新的周期，删除排行榜
                const r = await this.deleteMany({state: true});
                await global.dao.north.deleteMany({}); // 开始时 删除 boss
                console.error('NORTH START , START DELETE RANK CRON', moment().format('YYYY-MM-DD HH:mm:ss') , r);
            },
        },
    );

};
