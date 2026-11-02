
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		gsid,
	} = ctx.request.body;
	gsid = Number.parseInt(gsid);
	let config = global.gameconfig.general[gsid];
	ctx.assert(config, 'invalid generalgsid');
	ctx.role.addItemsNoSave({gsid, formark: 1});
	await ctx.role.save();
	ctx.body = {};
}