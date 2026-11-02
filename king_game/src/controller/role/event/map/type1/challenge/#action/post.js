/**
 * 武将事件战斗开始/返回敌方阵容
 */

'use strict'

const MOB_LV_RANGE = [
	70,
	90,
	999,
]

module.exports = async ctx =>{	
	let {
		MOBS,
	} = ctx.config;
	let mob_id;
	for (let i = 0; i < MOBS.length; i++) {
		mob_id = MOBS[i];
		if (ctx.role.level < MOB_LV_RANGE[i]) break;
	}
	// 返回敌方阵容
	if (ctx.params.action === 'data') {
		ctx.assert(mob_id, 'invalid battledata');
		ctx.body = {
			battleset: global.gameconfig.battlemapevent[mob_id],
		}
		return;
	}
	if (ctx.params.action !== 'start') return;
	ctx.assert(!ctx.event.battlewin, 'battle finished');
	let mark = [
		ctx.event.event.id,
		ctx.role.level,
	].join('_');
	let battle = new ctx.dao.c_battle({
		type: 'mapevent',
		rid: ctx.role._id,
		player: await ctx.role.getBattleSet('normal'),
		mark,
	})
	await battle.createEnemy(mob_id).save();
	ctx.body =  battle.base()
}
