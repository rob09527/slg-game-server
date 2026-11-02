
'use strict'

module.exports = exports = async (ctx, next) =>{
	await next();

	ctx.body.damge = ctx.boss.lastdamge;
	ctx.times = ctx.times || 1;
	let out = [];
	for (let i = 0; i < ctx.times; i++) {
		for (let {GSID, COUNT: [min, max]} of ctx.config.CREWARD) {
			let c = ctx.random.between(min, max);
			out.push({GSID, COUNT: c});
		}
	}
	out = out.arrange();
	ctx.role.addItemsNoSave(out, {main: 'chapter', sec: 'dboss'});

	ctx.body.rewards = out;
	if (ctx.config.HP <= ctx.boss.totaldamge) {
		ctx.dao.mail.create({
			type: 2, rid: ctx.role._id,
			title: ctx.textgetter('DBOSSKT'),
			content: ctx.textgetter('DBOSSKC', ctx.config.NAME),
			reward: ctx.config.KREWARD,
		}).catch(console.error);
		ctx.boss.kill = Date.now();
		ctx.body.kill = 1;
	}

	await ctx.role.save();
	await ctx.boss.save();
}
