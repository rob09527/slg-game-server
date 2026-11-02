
'use strict'
// 国战-获取奖励

module.exports = exports = async (ctx, next) => {
    const { AUDI_REWARD: audi_rewards, MATCH_REWARD: match_rewards, OPEN_REWARD: open_rewards, FINAL_RANK: final_rewards } = global.gameconfig.nationwar_reward || {};

    /**
    * 参赛奖励1-3轮只能从8点半以后到当天的24点获取。超时不能领取
    */
    // 开场奖励 只要创建国战对象就能领取开场奖励
    // 观众奖励 0点刷新  round <4 && state=3 没有入驻过的
    // 参赛奖励 0点刷新  round <4 && state=3 每一轮有入驻过的
    // 结算奖励 最后一轮的结算奖励 round == 4 && state=3
    let { type } = ctx.request.body;
    ctx.assert(type, 'invalid type');
    ctx.assert(ctx.nationwarInfo, 'no data');
    let rewards = [];
    //todo 
    if (type == 'audi') {
        // 观众奖励
        // 0点刷新。
        await ctx.getReward({
            type: 'audi',
            servid: ctx.role.servid,
        });
        let audi_rids = ctx.nationwarInfo.audiencerewards;
        ctx.assert(!audi_rids.includes(ctx.role.i()), 'audi has get');
        audi_rids.push(ctx.role.i());
        ctx.nationwarInfo.audiencerewards = audi_rids;
        ctx.nationwarInfo.markModified('audiencerewards');
        await ctx.nationwarInfo.save();
        //return rewards
        rewards = audi_rewards;
        ctx.role.addItemsNoSave(rewards, { main: 'nationwar audi reward', sec: 'nationwar' });
        await ctx.role.save();
        console.log('NATION_REWARD', type, ctx.role.servid, ctx.role.uid, new Date().toLocaleString());
    } else if (type == 'match') {
        // 判断是否领取过
        let match_rids = ctx.nationwarInfo.matchrewards;
        ctx.assert(!match_rids.includes(ctx.role.i()), 'match has get');
        // 参赛奖励
        let result = await ctx.getReward({
            type: 'match',
            servid: ctx.role.servid,
            uid: ctx.role.uid
        })
        match_rids.push(ctx.role.i());
        ctx.nationwarInfo.matchrewards = match_rids;
        ctx.nationwarInfo.markModified('matchrewards');
        await ctx.nationwarInfo.save();
        //return rewards
        rewards = match_rewards;
        ctx.role.addItemsNoSave(rewards, { main: 'nationwar match reward', sec: 'nationwar' });
        await ctx.role.save();
        console.log('NATION_REWARD', type, ctx.role.servid, ctx.role.uid, new Date().toLocaleString());
    } else if (type == 'open') {
        // 开场奖励
        // 只领一次
        // 周六并且这个服务器参加
        let openrewards = ctx.nationwarInfo.openrewards;
        ctx.assert(!openrewards.includes(ctx.role.i()), 'has get');
        openrewards.push(ctx.role.i());
        ctx.nationwarInfo.markModified('openrewards');
        await ctx.nationwarInfo.save();
        // return rewards
        rewards = open_rewards;
        ctx.role.addItemsNoSave(rewards, { main: 'nationwar open reward', sec: 'nationwar' });
        await ctx.role.save();
        console.log('NATION_REWARD', type, ctx.role.servid, ctx.role.uid, new Date().toLocaleString());
    } else if (type == 'final') {
        // 结算奖励
        let match = await ctx.getReward({
            type: 'final',
            servid: ctx.role.servid,
            uid: ctx.role.uid
        })
        if (match.index == 0) {
            rewards = final_rewards[0];
        } else {
            rewards = final_rewards[final_rewards.length - match.index];
        }
        // return rewards
        ctx.assert(rewards, 'invalid rewards');
        
        // 判断是否领取过了。
        let finalrewards = ctx.nationwarInfo.finalrewards || [];
        ctx.assert(!finalrewards.includes(ctx.role.i()), 'has get');
        ctx.role.addItemsNoSave(rewards, { main: 'nationwar final reward', sec: 'nationwar' });
        await ctx.role.save();

        finalrewards.push(ctx.role.i());
        ctx.nationwarInfo.markModified('finalrewards');
        await ctx.nationwarInfo.save();
        // clean battleset
        // 清空玩家王者阵容、武将上阵记录
        let udp = {
            $unset: {
                'battlearr.nationwar1': 1,
                'battlearr.nationwar2': 1,
                'battlearr.nationwar3': 1
            }
        }
        // 清空武将身上的阵容标记

        let udp1 = {
            $unset: {
                'battleset.nationwar1': 1,
                'battleset.nationwar2': 1,
                'battleset.nationwar3': 1
            }
        }
        // 清掉玩家阵容和武将阵容
        await ctx.dao.role.updateOne({ servid: ctx.role.servid, uid: ctx.role.uid }, udp);
        await ctx.dao.general.updateMany({ rid: ctx.role.rid }, udp1);
        console.log('NATION_REWARD', type, ctx.role.servid, ctx.role.uid, new Date().toLocaleString());
    }
    ctx.body = { rewards };
}