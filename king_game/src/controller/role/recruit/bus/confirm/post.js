
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.assert(ctx.blackboard.buslist.length === 10, 'preview first');
	ctx.role.addItemsNoSave(ctx.blackboard.buslist);
	let newg = [].append(ctx.role.newg);
	await ctx.role.save();
	let $unset = {
		'others.93197': 1,
	}
	await ctx.role.updateOne({$unset});
	ctx.body = newg.map(function (doc) {
		doc._role = ctx.role;
		return doc.base();
	});
}