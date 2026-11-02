
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		batch,
	} = ctx.request.body;
	let params = {
		batch,
		uid: ctx.role.uid,
		servid: ctx.role.servid,
	}
	let {
		content,
	} = await ctx.psendslim('/gserv/rebate/confirm', params);
	ctx.role.addItemsNoSave(content);
	await ctx.role.save();
	ctx.body = {
		items: content,
	}
}