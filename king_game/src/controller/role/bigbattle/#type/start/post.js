
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.assert(+ctx.request.body.subindex === ctx.record.subindex, 'chapter error'); // 增加验证当前关卡是否对应
	let battle = new ctx.dao.c_battle({
		type: ctx.battletype,
		rid: ctx.role._id,
		player: await ctx.role.getBattleSet('normal'),
		rcards: ctx.chapter.RCARDS // 敌军buff
	})
	battle._enemy_type = ctx._enemy_type;
	await battle.createEnemy(ctx.chapter.ID).save();
	ctx.body =  battle.base();
}
