
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		rid,
	} = ctx.request.body;
	let role = await ctx.dao.role.findOne({_id: rid}, {uid: 1});
	ctx.assert(role, 'invalid rid');
	// ctx.kingdom.shames
	let $push = {
		shames: {
			rid,
			//endtime: Date.now() + 24 * 60 * 60 * 1000
			endtime: Date.now() + global.gameconfig.others.KINGDOM_YOUJIE_TIME //  游街时间修改读配置
		}
	}
	await ctx.kingdom.updateOne({$push});
	//TODO 更新缓存
	ctx.body = {};
}
