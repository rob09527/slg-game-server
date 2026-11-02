'use strict';
// 国战
const moment = require('moment');
module.exports = exports = async (ctx, next) => {
    ctx.nationwarInfo = await ctx.dao.nationwar.findOne({ groupid: ctx.role._gameserv.groupid });
    ctx.assert(ctx.nationwarInfo, 'no open');
    let info = await ctx.dao.nationwar_serverinfo.findMarkByServid(ctx.role.servid);
    ctx.assert(info, 'no data');
    ctx.nation_match = await ctx.dao.nationwar_match.findOne(
        { groupmark: info },
        { round: 1, nexttime: 1, state: 1, groupmark: 1, nextroundtime: 1 });
    // 判断是否超过领取时间。
    if (moment().startOf('days').valueOf() > ctx.nationwarInfo.reward_time) {
        // 更新
        await ctx.dao.nationwar.updateOne({ groupid: ctx.role._gameserv.groupid }, { $unset: { audiencerewards: 1, matchrewards: 1 }, $set: { reward_time: moment().startOf('days').valueOf() } });
        ctx.nationwarInfo = await ctx.dao.nationwar.findOne({ groupid: ctx.role._gameserv.groupid });
    }
    ctx.getReward = async (opt) => {
        const {
            servid,
            uid,
            type,
            check
        } = opt
        let body = {};
        ctx.assert(type, 'invalid type');
        let info = await ctx.dao.nationwar_serverinfo.findMarkByServid(servid);
        let a_mark = await ctx.dao.nationwar_serverinfo.findAreamarkByServid(servid);
        ctx.assert(info, 'no data');
        // 查这个跨服组标记下的跨服组状态信息
        let nation = await ctx.dao.nationwar_match.findOne(
            { groupmark: info },
            { round: 1, state: 1 });
        let match = await ctx.dao.nationwar_battleinfo.findOne({ servid, uid, areamark: a_mark },
            { c_apply: 1, c_settlement: 1 });
        ctx.assert(nation && nation.state == 3, 'no in this time');

        if (type == 'audi') {
            // 观众
            // 查当前的round和state
            // 没有参赛
            ctx.assert(!match || match && Object.keys(match.c_settlement).length == 0, 'no user data');
            body = { round: nation.round, state: nation.state, match }
        } else if (type == 'match') {
            ctx.assert(nation && [1, 2, 3].includes(nation.round), 'need round != 4');
            // 赛制
            ctx.assert(match && Object.keys(match.c_settlement).length > 0, 'no user data');
            body = {
                match: match,
                round: nation.round
            }
        } else if (type == 'final') {
            // 结算奖励
            ctx.assert(nation && nation.round == 4, 'need round = 4');
            // 查玩家是否已经领取
            let result = await ctx.dao.nationwar_battleinfo.findOne({ servid, uid, areamark: a_mark },
                { finalreward_get: 1, c_apply: 1, areamark: 1 });
            // 是否参赛过（就是入驻过的）
            ctx.assert(result, 'no challenge');
            ctx.assert(!result.finalreward_get, 'has get');
            if (!check) {
                // 保存已经领取
                await ctx.dao.nationwar_battleinfo.updateOne({ servid, uid }, { $set: { finalreward_get: Date.now() } });
            }

            // 返回当前服务器排名
            let outInfo = await ctx.dao.nationwar_serverinfo.findOne({ areamark: result.areamark }, { isout: 1 });
            body = {
                index: outInfo.isout
            }
        }
        return body;
    }
    await next();
};
