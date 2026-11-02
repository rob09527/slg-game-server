
'use strict'


const incrAndExpire = require("../../../../../util/incrAndExpire");

module.exports = exports = async (ctx, next) => {
    let {
        target,
    } = ctx.request.body;
    ctx.assert(target != ctx.role._id, 'no challenge itself');
    //准备战斗数据
    const battleset = await ctx.role.getBattleSet('normal');
    // let battleset = await role.getBattleSet('normal');
    let result = await incrAndExpire(ctx.role.rid)
    if (result > global.gameconfig.secretRealmWdjz[1][0].PKLIMITNUM) {
        throw (`Exceeding the number of challenges${result}`)
    }
    const battle = new ctx.dao.c_battle({
        rid: ctx.role._id,
        type: 'secretpvp',
        player: battleset,
        mark: target,
    })

    let enemy;
    let role = await ctx.dao.role.findOne({ _id: target })
    let targetbattleset = await role.getBattleSet('normal');
    ctx.assert(role, 'role null');
    enemy = {
        level: role.level,
        battleset: targetbattleset,
    }
    let skills
    skills = !skills ? await ctx.dao.zbdepot.getAllZbSkill({ rid: target }) : skills;
    battle.rcards.push(...skills.map(id => ({ id })));

    await battle.createEnemy(enemy.battleset);
    battle.season.right = enemy.level;
    await battle.save();
    ctx.body = battle.base()
}

