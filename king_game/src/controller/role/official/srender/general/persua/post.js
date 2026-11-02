/**
 * 劝降武将
 */
'use strict'

const updateRoleseat = require("../../../../../../model/role/instance/updateRoleseat");

module.exports = exports = async function (ctx, next) {
	let {
		id,
	} = ctx.request.body;
	ctx.assert(ctx.prisoner.state == 0, 'cant persuade');
	if (ctx.prisoner.imprisonmentTime) {
		ctx.assert(ctx.prisoner.imprisonmentTime < Date.now(), 'cant behead 2');
	}
	ctx.role.castItemsNoSave(ctx.config.CAST);
	ctx.body = {};
	let is_success = false;
	if (ctx.prisoner.persua >= ctx.config.LOWEST) {
		let _success_rate = ((100 - ctx.prisoner.loyal) / 200) * 100;
		is_success = ctx.random.hit(_success_rate);
	} else {
		ctx.prisoner.persua++;
	}
	//
	//
	if (is_success || ctx.prisoner.loyal <= 0) {
		ctx.prisoner.loyal = 0;
		ctx.prisoner.state = 1;
		ctx.body.reward = { gsid: ctx.prisoner.gsid };
		await updateRoleseat(ctx.role._id.toString(), id, "delete")
		ctx.role.addItemsNoSave(ctx.body.reward);
		ctx.role.missionInvoke('GENERAL_PERSUA');
	} else {
		const del = ctx.random.between(ctx.config.LOYAL.RANGE[0], ctx.config.LOYAL.RANGE[1]);
		ctx.prisoner.loyal -= del;
		ctx.prisoner.loyal = Math.max(ctx.prisoner.loyal, 0);
		ctx.body.loyal = ctx.prisoner.loyal;
	}
	await ctx.role.save();
}
