
'use strict'
// 神将信息
const moment = require('moment');
module.exports = exports = async (ctx, next) => {
    const wbossconfig = global.gameconfig.legionwboss;
    const { END_DAY: wboss_end = 4 } = wbossconfig.CONFIG;
    let boss = {};// 存boss相关数据
    //获得季节
    let { season, etime } = ctx.bseason();
    // 获得当前季节的boss
    let wbossInfo = wbossconfig.BOSS_INFO[season];
    ctx.assert(wbossInfo, 'no wboss config');
    // boss
    let bset = global.gameconfig.battlelegionwboss[wbossInfo.ID];
    let nexttime, endtime, hasgift;
    if (moment().day() === wboss_end) {
        //备战期
        nexttime = moment(moment().format('YYYY-MM-DD')).add(1, 'days').valueOf();
    } else {
        // 挑战期
        // 挑战结束时间
        endtime = etime;
        hasgift = ctx.role.getItems(90390).count;
    }
    let params = {
        legion: ctx.legion._id,
        servid: ctx.legion.servid,
        uid: ctx.role.uid,
        lname: ctx.legion.name
    }

    const legionwboss = await ctx.dao.legionwboss.findOne({
        servid: ctx.role.servid,
        rid: ctx.role.i(),
        legion: ctx.role.legion
    });
    let lastdamage = 0;
    let totaldamages = 0;

    if(legionwboss) {
        lastdamage = legionwboss.lastdamages;
        totaldamages = legionwboss.totaldamages;
    }

    // 玩家是否能领取军团排行奖励
    boss = {
        id: wbossInfo.ID,
        nexttime,
        endtime,
        lastdamage,
        bset,
        hasgift
    };

    // 世界排名
    let wlegionrank = await ctx.legionwbossRank.rank(1,50);


    let roleList = await ctx.legionwbossRoleRank.rank(1,50);

    ctx.assert(wlegionrank && roleList , 'invalid rank');

    // 获得当前军团的世界排名
    let legionrank = await ctx.legionwbossRank.getItemRank(ctx.legion._id.toString());

    let legionDamage = await ctx.legionwbossRank.getItemScore(ctx.legion._id.toString());


    let legion = {
        rank: legionrank,
        maxrank: Math.max(ctx.legion.wbosshistroyrank||0, legionrank), // 历史最高排名
        damage: legionDamage
    }
    const legionids = wlegionrank.map(item => item.id);

    const legions = await ctx.dao.legion.find({ _id: {$in: legionids} }, {name: 1, _exp: 1, servid: 1,  flag: 1, wbosshistroyrank: 1});
    const legionMap = {};
    legions.forEach(l => {
        legionMap[l._id] = l;
    })
    // 当前世界前50名军团信息
    let worldrank = wlegionrank.map(item => {
            const l = legionMap[item.id] || {};
            return {
                name: l.name,
                level: l.level,
                flag: l.flag,
                server: l.servid,
                maxrank: l.wbosshistroyrank,
                damge: item.score,
                rank: item.rank
            }
    });

    let myrank =  await ctx.legionwbossRoleRank.getItemRank(ctx.role.i());
    let ownerTotaldamages =  await ctx.legionwbossRoleRank.getItemScore(ctx.role.i());
    // 个人伤害排名
    let self = { rank: myrank, damage: ownerTotaldamages }
    const rids = roleList.map(item => item.id);
    const roles = await ctx.dao.role.find({ _id: {$in: rids} }, {headid: 1,frameid: 1,iconid: 1, 'hide.38001': 1, 'hide.38003': 1, rname: 1,_power:1,_powerbattleset:1});
    const roleMap = {};
    roles.forEach(role => {
        roleMap[role._id] = role;
    })

    // 军团内个人伤害排名榜
    const rank = roleList.map(item => {
        const role = roleMap[item.id] || {};
        return {
            damge: item.score,
            rid: item.id,
            headid: role.headid,
            frameid: role.frameid,
            icon: role.iconid,
            level: role.level,
            power: role._power,
            rank: item.rank,
            name: role.rname        }
    })


    ctx.body = {
        legion,
        boss,
        self,
        rank,
        worldrank
    }
}
