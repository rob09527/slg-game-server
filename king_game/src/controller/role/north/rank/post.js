'use strict';

module.exports = exports = async (ctx, next) => {
    const groupid = ctx.role._gameserv.groupid;
    const rankList = await ctx.dao.north_rank.find({groupid: groupid}).sort({totaldamge: -1}).limit(50);
    const ownerid =  ctx.role.i();

    const rids = rankList.map(r => {

        return r.rid;
    });
    const ownerRank = await ctx.dao.north_rank.findOne({ rid: ownerid});
    const ownerdamge = ownerRank ? ownerRank.totaldamge : 0;
    let ownerrank = undefined;
    if (ownerdamge){
        ownerrank = await ctx.dao.north_rank.countDocuments({groupid, totaldamge: {$gt: ownerdamge}});
        ownerrank = ownerrank + 1;
    }

    const roles = await ctx.dao.role.find({_id: {$in: rids}}, {rname: 1, rno: 1,headid: 1, set: 1,  frameid: 1, icon: 1, hide: 1, _power: 1});
    const roleMap = {};
    roles.forEach(r => {
        roleMap[r._id] = r;
    });
    const killrewards = await ctx.dao.north.getKillReward(groupid);
    ctx.body = {
        rank: rankList.map(r => {
            const role = roleMap[r.rid] || {set: {}};
            return {
                rid: r.rid,
                icon: role.icon,
                level: role.level,
                vip: role.set.vipHide ? 0: role.vip,
                name: role.name,
                power: role._power,
                headid: role.headid,
                frameid: role.frameid,
                totaldamge: r.totaldamge,
            };
        }),
        ownerdamge : ownerRank ? ownerRank.totaldamge : 0,
        ownerrank,
        killrewards: killrewards && killrewards.arrange(),
    };
};
