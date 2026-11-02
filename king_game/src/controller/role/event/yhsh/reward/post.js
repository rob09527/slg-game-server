
'use strict'



module.exports = exports = async function (ctx, next) {
	const {
		YHSH: {
			TASK,
		}
	} = global.gameconfig.zhd_newhero;
	
	let {
		index,
	} = ctx.request.body;
	index = Number.parseInt(index);
	let config = TASK[index];
	ctx.assert(config, 'invalid index');
	let {
		ITEMS,
		RMARK,
		FINISH,
	} = config;
	// 检查是否已领取
	let is_take = RMARK.every(({GSID, COUNT}) => {
		return ctx.role.getProp(GSID) >= COUNT;
	})
	ctx.assert(!is_take, 'already take');
	// 检查是否完成
	let is_finish = FINISH.every(({GSID, COUNT}) =>{
		return ctx.role.getProp(GSID) >= COUNT;
	})
	ctx.assert(is_finish, 'not finish');
	// 发标记和奖励
	ctx.role.addItemsNoSave([
		...ITEMS,
		...RMARK,
	]);
	await ctx.role.save();
	ctx.body = ITEMS;
	// 周活动日志-英魂守护
    ctx.zhdprint("yhsh", index);
}