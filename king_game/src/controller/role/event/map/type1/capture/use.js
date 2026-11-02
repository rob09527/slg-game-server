
'use strict'

module.exports = async (ctx, next) =>{
	ctx.body = {};
	ctx.assert(ctx.event.battlewin !== undefined, 'battle nyet');
	await next();
	// 放弃/剩余追击次数少于1/已成功俘虏武将,自动领奖
	if (ctx.path.endsWith('giveup') || ctx.event.catchchance < 1 || ctx.body.generals) {
		let _ctx = {
			...ctx,
			path: '/role/event/map/finish',
		}
		await ctx._controllerDispatch(_ctx);
		let {
			error,
			reward,
		} = _ctx.body;
		ctx.assert(!error, error);
		ctx.body.reward = reward;
	}
}
