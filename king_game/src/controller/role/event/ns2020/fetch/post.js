
'use strict'

module.exports = exports = async function (ctx, next) {
	let [stime, etime] = global.config.ZHD.CJHD;
	ctx.body = {stime, etime};
	if (ctx.event.pos) ctx.body.pos = ctx.event.pos;
	if (ctx.event.boss) {
		let config = ctx.config;
		let {id, lastdamge, totaldamge} = ctx.event.boss;
		let info = {
			id: ctx.mid,
			maxhp: config.HP,
			nowhp: config.HP - totaldamge,
			damage: lastdamge
		}
		ctx.body.info = info;
	}
}