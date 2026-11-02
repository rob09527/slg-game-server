'use strict'

module.exports = exports = async (ctx, next) => {
    ctx.assert(ctx.boss.killed === 0, 'boss is killed');
    ctx.assert(ctx.boss.expireAt >= Date.now(), 'boss is expired');

    const bset = await ctx.role.getBattleSet('normal');
    let battle = new ctx.dao.c_battle({
        type: 'fboss',
        rid: ctx.role._id,
        player: bset,
    });
    await battle.createEnemy(ctx.boss.bossid).save();
    let self = ctx.boss.roles.deepQueryOne('rid', ctx.role.i());
    if (!self) {
        self = {rid: ctx.role.i(), damges: 0, lastdamges: 0, team: bset && bset.team};
        ctx.boss.roles.push(self);
    } else {
        self.team = bset && bset.team; // 保存队伍信息
    }
    ctx.boss.markModified('roles.' + ctx.boss.roles.indexOf(self));
    await ctx.boss.save();
    ctx.body =  battle.base();
}
