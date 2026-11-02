/**
 * 俘虏砍头
 */
'use strict'

const updateRoleseat = require("../../../../../../model/role/instance/updateRoleseat");

module.exports = exports = async function (ctx, next) {
	let {
		id,
	} = ctx.request.body;
	ctx.assert(ctx.prisoner.state == 0, 'cant behead');
	if (ctx.prisoner.imprisonmentTime) {
		ctx.assert(ctx.prisoner.imprisonmentTime < Date.now(), 'cant behead 2');
	}



	ctx.prisoner.state = 2;
	ctx.role.addItemsNoSave(ctx.config.KILL);
	ctx.body = ctx.config.KILL
	await updateRoleseat(ctx.role._id.toString(), id, "delete")
	await ctx.role.save();
}