
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.body = {};
	ctx.boss = ctx.event.boss;
	await next();
	ctx.event.markModified('boss');
	// 挑战奖励
	let reward = ctx.config.CITEMS.map(({GSID, COUNT: [MIN, MAX]}) =>{
		return {
			GSID,
			COUNT: ctx.random.between(MIN, MAX),
		}
	})
	ctx.body.reward = reward;
	if (ctx.boss.totaldamge >= ctx.config.HP) {
		ctx.body.kill = 1;
		ctx.event.finish = Date.now();
		ctx.role.addItemsNoSave(90330);
		ctx.dao.mail.create({
			type: 2, rid: ctx.role._id,
			title: ctx.textgetter('CJBOSST', ctx.config.NAME),
			content: ctx.textgetter('CJBOSSC', ctx.config.NAME),
			reward: ctx.config.KITEMS,
		}).catch(console.error);
	}else{
		let {lastdamge, totaldamge} = ctx.boss;
		let info = {
			id: ctx.mid,
			maxhp: ctx.config.HP,
			nowhp: ctx.config.HP - totaldamge
		}
		ctx.body.info = info;
	}
	ctx.role.addItemsNoSave(reward);
	await ctx.event.save();
	await ctx.role.save();
}