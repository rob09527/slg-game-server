
'use strict'

module.exports = exports = async (ctx, next) => {
	const { rid } = ctx.request.body;
	const ship = ctx.legion._members.deepQueryOne('rid', rid);
	ctx.assert(ship, 'ship nexist');
	ctx.legion._members.remove(ship);
	const role = await ctx.dao.role.findOne({ _id: rid });
	role.legion = null;
	role.legionName = null;
	role.others['90299'] = undefined;
	role.markModified('others.90299');
	// 清理贡献记录
	if (ctx.legion.donation[role.i()]) {
		delete ctx.legion.donation[role.i()];
		ctx.legion.markModified('donation');
	}
	// 如果开启了神将试炼,被踢了重置领取排行奖励的标记
	if (ctx.legion.secretplace > 0 && role.getItems(90390).count > 0) {
		role.castItemsNoSave({ gsid: 90390, count: 1 });
	}
	// 重新设置加入军团时间
	role.legionjointime = 0;
	role.markModified('legionjointime');

	// 操作自己需要被锁定12小时不能入团
	if (role.getItems(90371).count < 1) {
		role.addItemsNoSave(90371);
	} else {
		role.lleft = Date.now();
	}
	await role.save();
	await ctx.legion.save();
	ctx.body = {};
}
