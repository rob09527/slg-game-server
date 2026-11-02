/**
 * 武将事件结束
 */

 module.exports = async ctx =>{
	let {
		battleid,
	} = ctx.request.body;
	let battle = await ctx.dao.c_battle.findOne({_id: battleid});
	ctx.assert(battle, 'invalid battleid');
	let {result: ret} = await battle.cal();
	ctx.body = {result: ret};
	ret = ret.ret;
	let battlewin = ret === 'win';
	let $set = {
		battlewin,
	}
	// 胜利时给出俘虏次数
	if (battlewin) $set.catchchance = (ctx.config.PURSUIT || 2) + 1;
	await ctx.event.updateOne({$set});

	// 输了自动请求奖励
	if (!battlewin) {
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
	}else{
		let _ctx = {
			...ctx,
			path: '/role/event/map/type1/capture/do',
			free_surrender: 1 // 自动招降免费
		}
		await ctx._controllerDispatch(_ctx);
		ctx.assert(!_ctx.body.error, _ctx.body.error);
		let {
			generals,
			reward,
		} = _ctx.body;
		if (generals) {
			ctx.body.generals = generals;
			ctx.body.reward = reward;
		}
	}
}
