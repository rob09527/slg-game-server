
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.assert(ctx.team.ready, 'not ready');
	const {rids = []} = ctx.request.body;
	let tmp = [];
	for (const rid of rids) {
		let fellow = ctx.team.fellows.deepQueryOne('rid', rid);
		ctx.assert(fellow, 'invalid rid');
		tmp.push(fellow);
	}
	ctx.assert(tmp.length == 3, 'invalid len');
	ctx.team.fellows = tmp;
	await ctx.team.save();
	ctx.body = {};
}