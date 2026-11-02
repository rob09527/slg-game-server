
'use strict'
// 开始战斗
module.exports = exports = async (ctx, next) => {
    let { friendid } = ctx.request.body;
    ctx.assert(friendid, 'invalid friendid')
    // 获取自身进攻阵容
    let player = await ctx.role.getBattleSet('pvpatt');
    ctx.assert(Object.keys(player.team).length > 0, 'not bset');

    // 获取好友的防守阵容
    let friendInfo = await ctx.dao.role.findOne({ _id: friendid });
    ctx.assert(friendInfo, 'no friend info');

    // 判断好友是否有pvpdef阵容
    let friendpvpbest = await friendInfo.getBattleSet('pvpdef');
    ctx.assert(Object.keys(friendpvpbest.team).length > 0, 'friend not pvpdef');

    let battle = new ctx.dao.c_battle({
        rid: ctx.role._id,
        type: 'friendpvp',
        player: player,
        mark: friendid
    });
    let enemy;
    enemy = {
        level: friendInfo.level,
        battleset: friendpvpbest
    }

    await battle.createEnemy(enemy.battleset);
    const skills = await ctx.dao.zbdepot.getAllZbSkill({rid: friendid});
    battle.rcards.push(...skills.map(id => ({id})))
	battle.season.right = enemy.level;
	await battle.save();

    ctx.body =  battle.base();
}
