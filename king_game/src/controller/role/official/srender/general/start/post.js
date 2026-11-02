
'use strict'
const expireUserinfo = require("../../../../../../util/expireUserinfo");
const acquireLock = require("../../../../../../util/acquireLock");
const checkPrisoner = require("../../../../../../model/prisoner/instance/checkPrisoner");
module.exports = exports = async (ctx, next) => {
    //劫狱武将的id
    let {
        id,
    } = ctx.request.body;
    console.log("开始战斗", id)

    let result = await acquireLock(`${id}-start-prisoner`, 5000)
    ctx.assert(result, 'Refresh and reselect the target');

    const key = `${ctx.role._id.toString()}-prisoner`
    var cacheInfo = await expireUserinfo(key, true)
    const target = cacheInfo.battle.target

    ctx.assert(target != ctx.role._id.toString(), 'no challenge itself');
    //准备战斗数据
    ctx.role.tianlao = {
        battlecount: cacheInfo.battle.battlecount,
        success: cacheInfo.battle.success
    }
    const battleset = await ctx.role.getBattleSet('normal');
    if (cacheInfo.battle.battlecount == 0) {
        await global.dao.prisonerRecord.updateOne({ _id: cacheInfo.battle.recordId }, { $set: { state: 1 } })
    }

    if (!cacheInfo || !cacheInfo.battle || cacheInfo.battle.battlecount >= global.gameconfig.surrenderfight[0][0].NUMLIMIT) {
        throw (`illegal request`)
    }


    const prisonerDoc = await global.dao.prisoner.findOne({ _id: id });
    ctx.assert(prisonerDoc, 'They took it away');
    ctx.assert(prisonerDoc.rid == target, 'The request object is not a legitimate user');

    ctx.assert(checkPrisoner(prisonerDoc), 'Expired generals');
    let config = global.gameconfig.surrender.deepQueryOne('GSID', prisonerDoc.gsid);
    ctx.assert(config, 'config error');
    ctx.role.castItemsNoSave(config.ITEM_1);
    cacheInfo.battle.gsid = prisonerDoc.gsid
    cacheInfo.battle.id = prisonerDoc.id
    cacheInfo.battle.itemInfo.push({ gsid: prisonerDoc.gsid, state: 0, id: prisonerDoc.id })
    const battle = new ctx.dao.c_battle({
        rid: ctx.role._id,
        type: 'prisonerpvp',
        player: battleset,
        mark: target,
    })

    let enemy;
    let role = await ctx.dao.role.findOne({ _id: target })

    let targetbattleset = await role.getBattleSet('normal');
    let tldefense = await role.getBattleSet('tldefense');

    ctx.assert(role, 'role null');
    enemy = {
        level: role.level,
        battleset: tldefense.power != 0 ? tldefense : targetbattleset,
    }
    let skills
    skills = !skills ? await ctx.dao.zbdepot.getAllZbSkill({ rid: target }) : skills;
    battle.rcards.push(...skills.map(id => ({ id })));

    await battle.createEnemy(enemy.battleset);
    battle.season.right = enemy.level;
    await ctx.role.save();
    await battle.save();
    var cacheInfo = await expireUserinfo(key, false, cacheInfo)
    ctx.body = battle.base()
}

