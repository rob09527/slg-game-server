
'use strict'

module.exports = exports = async function (ctx, next) {
	let tmp = [];
	const config = global.gameconfig.signreward;
	ctx.role.missionInvoke('DENGLU');
	const days = ctx.role.getProp(90484);
	let marks = ctx.role.getProp(90485);
	while (days > marks){
		const index = marks % config.length;
		tmp.push(config[index]);
		marks++;
	}
	// 当天有充值记录则可以领取当天的双倍奖励
	let doubleTody = ctx.role.getProp(90221) > 0 && ctx.role.getProp(90518) == 0;
	if(doubleTody) {
		tmp.push(config[(days - 1) % config.length]);
		ctx.role.addItemsNoSave({ GSID: 90518, COUNT: 1 });
	}
	ctx.role.addItemsNoSave({GSID: 90485, COUNT: days - ctx.role.getProp(90485)});
	tmp = tmp.filter(Boolean).arrange();
	ctx.role.addItemsNoSave(tmp);
	await ctx.role.save();
	ctx.body = tmp;
}
