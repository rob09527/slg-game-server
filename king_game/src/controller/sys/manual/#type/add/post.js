
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {gsid, count} = ctx.request.body;
	count = parseInt(count);
	const before = ctx.role.getItems(gsid).count;
	let fn = 'addItemsNoSave';
	if (count < 0) fn = 'castItemsNoSave';
	count = Math.abs(count);
	ctx.role[fn]({gsid: gsid, count: count}, 'manual')
	await ctx.role.save();
	const after = ctx.role.getItems(gsid).count;
	ctx.body = {before: before, after: after};
	console.log('MANUAL ADD', ctx.role.uid, ctx.role.servid, gsid, count);
}