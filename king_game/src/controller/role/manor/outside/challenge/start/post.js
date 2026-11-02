
'use strict'
// 开始战斗
module.exports = exports = async (ctx, next) => {
    let { index, friendid } = ctx.request.body;
    // 判断friendid 是否有值,有值则表示用好友阵容打小怪了。要禁止
    if (friendid && index >= 0) ctx.assert(false, 'no challenge monster')
    let player;
    if (friendid) {
        let friend = await ctx.dao.role.findOne({ _id: friendid });
        ctx.assert(friend, 'friend err');
        let friendbset = await friend.getBattleSet('normal');
        ctx.assert(Object.keys(friendbset.team).length > 0, 'not bset');
        const { FRIEND_BOSS_HELP: friend_help } = global.gameconfig.newmanor.CONFIG;
        // 判断好友助战次数
        ctx.assert(ctx.role.getItems(90365).count < friend_help, 'no friend help count');
        // 次数增加
        ctx.role.addItemsNoSave({ gsid: 90365, count: 1 });
        // 次数增加
        player = friendbset;
    } else {
        player = await ctx.role.getBattleSet('normal');
    }
    let battle = new ctx.dao.c_battle({
        rid: ctx.role._id,
        type: index >= 0 ? 'newmanor' : 'newmanorboss',
        player: player,
        mark: friendid
    });

    // 判断index 是打boss 还是打小怪
    if (index >= 0) {
        // 小怪
        let monster = ctx.manor.monsters[index];
        ctx.assert(monster, 'invalid monster');
        // 判断小怪是否死了
        ctx.assert(monster.state == 1, 'monster has dead');
        // 判断有没有打过
        await battle.createEnemy(monster.id).save();
    } else {
        // boss
        let boss = ctx.manor.bossinfo[0];
        ctx.assert(boss, 'invalid boss')
        // 判断是否阵亡
        ctx.assert(boss.state < 3, 'boss has dead');
        await battle.createEnemy(boss.id, boss.cachehp).save();
    }
    await ctx.role.save()
   
    ctx.body = battle.base();
}