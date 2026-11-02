'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.body = {};
	await next();

	// 计算挑战奖励
	ctx.times = ctx.times || 1;
	let reward = [];
	for (let {GSID, COUNT} of ctx.detail_config.CREWARD) {
		reward.push({GSID, COUNT: COUNT * ctx.times});
	}
	ctx.role.addItemsNoSave(reward);
	ctx.body.reward = reward;
	// 击杀boss保存信息发送奖励邮件
	let base = ctx.boss.base();
	if (base.nowhp <= 0) {
		ctx.boss.kill = Date.now();
		// 异步发送邮件
		ctx.dao.mail.create({
			type: 2,
			rid: ctx.role._id,
			title: ctx.textgetter(`ZHD${ctx.tag.toUpperCase()}T`),
			content: ctx.textgetter(`ZHD${ctx.tag.toUpperCase()}C`),
			reward: ctx.detail_config.KREWARD,
		}).catch(console.error);
	}
	await ctx.boss.save();
	await ctx.role.save();
	// 周活动日志-探囊取物
	let kill = ctx.boss.kill ? 1 : 0
	for(let i = 0; i< ctx.times; i++) {
		let tmpKill = 0
		if(i === ctx.times - 1) tmpKill = kill
		ctx.zhdprint(ctx.tag, ctx.boss.bossid, tmpKill)
	}
}