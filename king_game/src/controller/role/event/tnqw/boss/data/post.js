
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		nowhp,
		maxhp,
	} = ctx.boss.base();
	let {
		lastdamge,
		last = 0,
	} = ctx.boss;
	ctx.body = {
		name: ctx.config.NAME,
		gsid: ctx.config.ICON,
		// 使用boss最高等级
		level: ctx.detail_config.LEVEL,
		challrewards: ctx.detail_config.CREWARD,
		killrewards: ctx.detail_config.KREWARD,
		nowhp,
		maxhp,
		lastdamge,
		last,
		bset: global.gameconfig[`battle${ctx.tag}boss`][ctx.boss.bossid],
	}
}