
'use strict'

module.exports = exports = async (ctx, next) => {
	const ship = ctx.legion._members.deepQueryOne('rid', ctx.role._id.toString());
	if (ship) ctx.legion._members.remove(ship);
	const legionroom = `legion_` + ctx.role.legion;
	// 离开军团房间
	global.socketRedis.leaveRoom(ctx.role.i(), legionroom);

	ctx.role.legion = undefined;
	ctx.role.others['90299'] = undefined;
	ctx.legion.markModified('others.90299');
	if (ctx.role.getItems(90371).count < 1) {
		ctx.role.addItemsNoSave(90371);
	} else {
		ctx.role.lleft = Date.now();
	}
	// 清理贡献记录
	if (ctx.legion.donation[ctx.role.i()]) {
		delete ctx.legion.donation[ctx.role.i()];
		ctx.legion.markModified('donation');
	}
	// 如果开启了神将试炼,被踢了重置领取排行奖励的标记
	if (ctx.legion.secretplace > 0 && ctx.role.getItems(90390).count > 0) {
		ctx.role.castItemsNoSave({ gsid: 90390, count: 1 });
	}
	// 重新设置加入军团时间
	ctx.role.legionjointime = 0;
	ctx.role.legionName = null;
	ctx.role.markModified('legionjointime');
	// 检查弹劾信息
	if (ctx.legion.tanhe && ctx.legion.tanhe.rid === ctx.role.i()) ctx.legion.tanhe = undefined;
	await ctx.role.save();
	await ctx.legion.save();
	ctx.dao.c_legionlog.create({ legion: ctx.legion._id, event: 'memberquit', params: [ctx.role.name] }).catch(console.error);	// async
	ctx.body = {};
}
