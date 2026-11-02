'use strict';

/*
* 国战擂台对手匹配
* */
module.exports = exports = async (ctx, next) => {
    const rid = ctx.role.i();
    const servid = ctx.role.servid;
    const r = await ctx.dao.ringrank.getTarget({
        role: {
            rid,
            servid,
            level: ctx.role.level,
            imageid: ctx.role.imageid,
            frameid: ctx.role.frameid,
            headid: ctx.role.headid,
            power: ctx.role._power,
            name: ctx.role.name,
            honor_value: ctx.role.honor_value,
        }
    })

    ctx.assert(!r.error, r.error);

    r.opponents.forEach(o => {
        if (o.robot_id) {
            // 机器人阵容数据处理
            for (const bset of o.bslist) {
                for (const pos in bset.team) {
                    let g = new ctx.dao.general(bset.team[pos]);
                    bset.team[pos] = g.base();
                }
            }
        }
    })
    ctx.body = r;
};
