
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		batch = '',
	} = ctx.request.body;
	ctx.assert(batch.length > 0, 'invalid batch');
	let params = {
		batch,
		uid: ctx.role.uid,
	}
	let state = 1;
	let data;
	try {
		data = await ctx.psendslim('/gserv/rebate/check', params);
	}catch(e) {
		// 没有返利可以领取
		if (e.message === 'no record') state = 0;
		// 返利已经领取
		if (e.message === 'already confirm') state = 2;
	}
	ctx.body = {
		state,
	}
	if (data && data.content) ctx.body.rewards = data.content;
	if (data && data.amount) ctx.body.amount = data.amount;
}