'use strict';

const {
    RANK_REWARD
} = global.gameconfig.military_position || {};
/*
* 积分排行榜
 跨服
* */
module.exports = exports = async (ctx, next) => {
    // 只查 最近这一周在线的玩家
    const lastweek = Date.now() - 24 * 3600 * 1000 * 7;
    const _sort_ = { 'hide.38018.count': -1 };
    const owner = ctx.role.i();
    let nation_serverinfo = await ctx.dao.nationwar_serverinfo.findOne({ groupid: ctx.role._gameserv.groupid }, { groupmark: 1 });
    let nationwar_servers = await ctx.dao.nationwar_serverinfo.find({ groupmark: nation_serverinfo.groupmark }, { servers: 1 })
    let servers = [];
    nationwar_servers.forEach(s => {
        servers.append(s.servers);
    });
    // 本次国战参赛服
    const ranks = await ctx.dao.role.find({ 'hide.38018.count': { $gt: 0 }, update: { $gt: lastweek }, servid: { $in: servers } }, {
        rname: 1,
        headid: 1,
        frameid: 1,
        servid: 1,
        'hide.38003': 1,
        'hide.38001': 1,
        'hide.38018.count': 1,
        'hide.38021.count': 1,
        'hide.38019.count': 1,
        update: 1,
        set: 1,
        _power: 1,
        sex: 1,
        _id: 1
    }).sort(_sort_).limit(50);
    let selfrank = 0;
    const list = ranks.map((role, index) => {
        const o = {
            rname: role.name,
            name: role.name,
            servid: role.servid,
            headid: role.headid,
            frameid: role.frameid,
            rid: role._id,
            vip: role.vip,
            set: role.set,
            honor: role.getProp(38018),
            military: role.military_level,
            level: role.level,
            sex: role.sex,
            lastest: role.update,
            isonline: role.isonline,
            power: role._power,
            rank: index + 1
        };
        if (owner === role.i()) {
            selfrank = o.rank;
        }
        return o;
    });
    //如果排名在50名开外，则需要再另外获取到自己的名词
    // const ownerHonor = ctx.role.getProp(38018);
    // if (!selfrank && ownerHonor){
    //     selfrank = 1 + (await ctx.dao.role.countDocuments({'hide.38018.count': {$gt: ownerHonor}}));
    // }
    // let preSettleExp = 0;
    // if (selfrank > 0){
    //     // 根据排名获得预
    //     for (const rk of Object.keys(RANK_REWARD).sort((a,b) => a-b)) {
    //         if (rk >= selfrank){
    //             preSettleExp =   RANK_REWARD[rk].ITEMS.filter(_ => +_.GSID === 38019)[0];
    //             preSettleExp = preSettleExp ? preSettleExp.COUNT : 0; // 返回 count 就行
    //             break;
    //         }
    //     }
    // }
    ctx.body = {
        list,
        selfrank: selfrank ? selfrank : 0,
        //  preSettleExp
    }
};
