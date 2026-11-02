'use strict';

module.exports = exports = async ctx => {
    const rid = ctx.role.i();
    const servid = ctx.role.servid;
    ctx.body = {};
    // 获取角色信息
    const player = ctx.role.avatarInfo();
    player.bslist = [];
    player.servid = servid;
    player.rid = rid;
    for (let i = 1; i <= 3; i++) {
        let bs_mark = `ringpvp${i}`;
        if (!ctx.role.battlearr[bs_mark]) {
            break;
        }
        let bs = await ctx.role.getBattleSet(bs_mark);
        bs.index = i - 1;
        player.bslist.push(bs);
    }

    const { opponent } = ctx.request.body;

    // 请求对手信息和标记开战api

    const r = await ctx.dao.ringrank.challengeStart({
        left: { rid, servid },
        right: { rid: opponent.rid, servid: opponent.servid, id: opponent.id },
    });
    if (r.target.robot_id) { // 对手是机器人
        // 转换阵容数据
        for (const bset of r.target.bslist) {
            for (const pos in bset.team) {
                let g = new ctx.dao.general(bset.team[pos]);
                bset.team[pos] = g.base();
            }
        }

    }
    const target = r.target;
    // 保存战斗数据
    const mark = {
        targetid: opponent.rid,
    };

    const battle = new ctx.dao.c_battle({
        rid: ctx.role._id,
        type: 'pvpking',
        player,
        enemy: r.target,
        mark: JSON.stringify(mark),
    });
    battle.season.left = player.level;
    battle.season.right = target.level;
    // 加载珍宝技能
    const zbskill = await ctx.dao.zbdepot.getAllZbSkill({rid: r.target.rid});
    battle.rcards.push(...zbskill.map(id => ({id})));
    await battle.save();

    // 整理返回信息
    ctx.body = battle.base()
}
