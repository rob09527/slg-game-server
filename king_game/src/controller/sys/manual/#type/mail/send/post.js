
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		title = '',
		content = '',
		reward,
	} = ctx.request.body;
	let cond = {
		rid: ctx.role._id,
		title,
		content,
	}
	if (Array.isArray(reward)) {
		reward = reward.arrange();
		if (reward.length >= 1) {
			cond.type = 2;
			cond.reward = reward;
		}
	}
	await ctx.dao.mail.create(cond);
	ctx.body = {};
}