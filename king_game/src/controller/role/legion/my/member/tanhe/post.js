
'use strict'

const {
	OFFLINEHOUR,
	TANHEYBNUM,
} = global.gameconfig.others.LEGION;

module.exports = exports = async (ctx, next) =>{
	const pos = ctx.legion._members.deepQueryOne('rid', ctx.role.i()).pos;
	ctx.assert(pos < 2, 'permission deny');
	const ship = ctx.legion._members.deepQueryOne('pos', 2);
	ctx.assert(ship, 'invalid ship');
	const ceo = await ctx.dao.role.findOne({_id: ship.rid});
	ctx.assert(ceo, 'role nexist');
	ctx.assert(Date.now() - ceo.update > OFFLINEHOUR * 60 * 60 * 1000, 'time limit');
	ctx.role.castItemsNoSave({gsid: 38005, count: TANHEYBNUM}, {main: 'legion', sec: 'tanhe'});
	// 不允许重复提交弹劾
	ctx.assert(!ctx.legion.tanhe || !ctx.legion.tanhe.start, "tanhe exist")
	ctx.legion.tanhe = {
		rid: ctx.role.i(),
		start: Date.now(),
	}
	ctx.legion.markModified('tanhe');
	await ctx.role.save();
	await ctx.legion.save();
	ctx.body = {};
	let params = [ctx.role.name, ceo.name];
	ctx.dao.c_legionlog.create({legion: ctx.legion._id, event: 'accuse', params}).catch(console.error);
}
