
'use strict'
// 国战-信息接口
module.exports = exports = async (ctx, next) => {
    const { AUDI_REWARD: audi_rewards, MATCH_REWARD: match_rewards, OPEN_REWARD: open_rewards, FINAL_RANK: final_rewards } = global.gameconfig.nationwar_reward || {};
    ctx.body = {};
    // 打印执行时间
    // 打印执行时间
    let timeprint_prefix = [ctx.path, ctx.role.uid, ctx.role.servid].join('_');
    // 打印执行时间
    console.time(timeprint_prefix + '_req');
    let __cmnwai = timeprint_prefix + '_cmnwai';
    console.time(__cmnwai);
    
    //缓存 下周弄
    let getWarInfo = async (opt) => {
        let { servid, uid } = opt

        let info = await ctx.dao.nationwar_serverinfo.findMarkByServid(servid);
        ctx.assert(info, 'no data');
        let myareamark = await ctx.dao.nationwar_serverinfo.findAreamarkByServid(servid);
        // 查这个跨服组标记下的跨服组状态信息
        let nation = await ctx.dao.nationwar_match.findOne(
            { groupmark: info },
            { round: 1, nexttime: 1, state: 1, groupmark: 1, nextroundtime: 1 });

        // 自己队伍入驻信息
        let myteaminfo = await ctx.dao.nationwar_battleinfo.findOne({ areamark: myareamark, servid, uid }, {
            c_settlement: 1,
            c_battlesetstate: 1
        });

        // 跨服组下的服务器信息
        let serversInfo = await ctx.dao.nationwar_serverinfo.find(
            { groupmark: info },
            {
                areamark: 1,
                servid: 1,
                groupmark: 1,
                servers: 1,
                name: 1,
                icon: 1,
                maxhp: 1,
                nowhp: 1,
                isout: 1,
                front: 1,
                back: 1,
                pre: 1,
                position: 1,
                kingname: 1
            }).sort({ position: 1 });

        return {
            nation,
            serversInfo,
            myareamark,
            myteaminfo
        };
    }
    let info = await getWarInfo({
        servid: ctx.role.servid,
        uid: ctx.role.uid
    });
    console.timeEnd(__cmnwai);
    let needdata = {};
    // 没有国战信息
    ctx.assert(info, 'no nationwar data');
    // 指挥官
    needdata.rid = ctx.nationwarInfo.rid;
    // 我服务器所在的区
    needdata.myareamark = info.myareamark;
    // 个人入驻信息
    needdata.mysettlement = info.myteaminfo && info.myteaminfo["c_settlement"] ? info.myteaminfo["c_settlement"] : {};
    // 处理数据
    if (info.nation) {
        let nation = info.nation;
        needdata.round = nation.round;
        needdata.nexttime = nation.nexttime;
        needdata.state = nation.state;
        needdata.groupmark = nation.groupmark;
        needdata.nextroundtime = nation.nextroundtime;
        needdata.kingname = nation.kingname;
    }
    if (info.serversInfo && info.serversInfo.length > 0) {
        let servs = info.serversInfo.map((data) => {
            // data是mongoose find查出来的，需要转成Object对象才能修改
            data = data.toObject();
            let frontarr = [0, 0];
            if (Object.keys(data.front).length >= 2) {
                frontarr[0] = Object.keys(data.front.left).length;
                frontarr[1] = Object.keys(data.front.right).length;
            }
            data.front = frontarr;
            let backarr = [0, 0];
            if (Object.keys(data.back).length >= 2) {
                backarr[0] = Object.keys(data.back.left).length;
                backarr[1] = Object.keys(data.back.right).length;
            }
            data.back = backarr;
            let prearr = [0];
            if (data.pre.length > 0) {
                prearr[0] = data.pre.length;
            }
            data.pre = prearr;

            // 封装返回数据
            return {
                areamark: data.areamark,
                servid: data.servid,
                icon: data.icon,
                name: data.name,
                nowhp: data.nowhp,
                maxhp: data.maxhp,
                isout: data.isout,
                kingname: data.kingname,
                team: {
                    front: data.front, 
                    back: data.back,
                    pre: data.pre
                }
            };
        })
        needdata.servs = servs;
    }
    let rewards = [];
    console.time(timeprint_prefix + '_audi');
    //  校验奖励
    try {
        await ctx.getReward({
            type: 'audi',
            servid: ctx.role.servid,
            uid: ctx.role.uid
        });
        let audi_rids = ctx.nationwarInfo.audiencerewards;
        if (!audi_rids.includes(ctx.role.i())) rewards.push('audi')
    } catch (error) {
        //    console.error('nationwar judge reward error', error);
    }
    console.timeEnd(timeprint_prefix + '_audi');
    console.time(timeprint_prefix + '_match');

    try {
        // 比赛奖励
        let match_rids = ctx.nationwarInfo.matchrewards;
        if (!match_rids.includes(ctx.role.i())) {
            // 参赛奖励
            let result = await ctx.getReward({
                type: 'match',
                servid: ctx.role.servid,
                uid: ctx.role.uid
            })
            // 比赛奖励
            if (result && result.match && Object.keys(result.match.c_settlement).length > 0) rewards.push('match');
        }

    } catch (error) {
        //       console.error('nationwar judge reward error 2', error);
    }
    console.timeEnd(timeprint_prefix + '_match');

    try {
        let openrewards = ctx.nationwarInfo.openrewards;
        // 开场奖励
        if (!openrewards.includes(ctx.role.i())) {
            rewards.push('open');
        }
    } catch (error) {
        //    console.error('nationwar judge reward error 3', error);
    }
    console.time(timeprint_prefix + '_final');

    try {
        let finalmatch = await ctx.getReward({
            type: 'final',
            servid: ctx.role.servid,
            uid: ctx.role.uid,
            check: 1
        })
        if (final_rewards[finalmatch.index]) rewards.push('final')
    } catch (error) {
        //    console.error('nationwar judge reward error 4', error);
    }
    console.timeEnd(timeprint_prefix + '_final');

    console.timeEnd(timeprint_prefix + '_req');

    needdata.rewards = rewards;
    ctx.body = needdata;
}
