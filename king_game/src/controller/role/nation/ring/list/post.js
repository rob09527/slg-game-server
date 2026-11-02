'use strict';

/*
* 国战擂台排行榜
* */
module.exports = exports = async (ctx, next) => {
    const groupmark = await ctx.dao.nationwar_serverinfo.findMarkByServid(ctx.role.servid);
    const roleObj = {
        imageid: ctx.role.imageid,
        frameid: ctx.role.frameid,
        headid: ctx.role.headid,
        iconid: ctx.role.iconid,
        level: ctx.role.level,
        power: ctx.role._power,
        name: ctx.role.name,
        servid: ctx.role.servid,
        honor_value: ctx.role.honor_value
    };
    let owner = await ctx.dao.ringrank.findOneAndUpdate({ rid: ctx.role.i(), 'role.servid': ctx.role.servid }, {
        $set: {
            role: roleObj
        }
    }, {
        new: true
    });
    const items = await ctx.dao.ringrank.find({ groupmark }, { honor_pool: 0, lock: 0, groupmark: 0, __v: 0, last_honor_time: 0 }).sort({ rank: 1 }).limit(200);

    if (owner) {
        const h = owner.honor;
        owner = owner.toJSON();
        owner.honor_pool = h; // 把结算的 honor 返回前端展示
        owner.honor_rate = global.dao.ringrank.getHonorRate(owner.rank);
        owner.honor_pool_limit = global.gameconfig.ring_rank.CONFIG.MAX_HONOR;
    }

    ctx.body = {
        items: items.map(it => {
            it = it.toObject();
            it.honor_rate = global.dao.ringrank.getHonorRate(it.rank);
            return it;
        }),
        owner
    }

};
