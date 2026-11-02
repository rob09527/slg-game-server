
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.body = {};
	let config = global.gameconfig.legionwarmob.deepQueryOne('ID', ctx.mob.mobid);
	ctx.assert(config, 'invalid mobid');
	await next();
	ctx.times = ctx.times || 1;
	let items = [];
	for (let i = 0; i < ctx.times; i++) {
		items.push(...config.CREWARD.map(({GSID, MINCOUNT, MAXCOUNT}) =>{
			return {
				GSID,
				COUNT: ctx.random.between(MINCOUNT, MAXCOUNT),
			}
		}))
	}
	items = items.arrange();
	ctx.body.items = items;

	// 检查击杀
	if (ctx.mob.totaldamage >= config.HP) {
		ctx.mob.kill = Date.now();
		ctx.body.kill = 1;
		items.append(config.KREWARD.map(o => ({...o, kill: 1})));
		// await ctx.dao.mail.create({
		// 	type: 2, rid: ctx.role._id,
		// 	title: ctx.textgetter('LEGION_WARMOB_KILL_T'),
		// 	content: ctx.textgetter('LEGION_WARMOB_KILL_C'),
		// 	reward: config.KREWARD,
		// })
	}


	ctx.role.addItemsNoSave(items, {main: 'legionwar', sec: 'mob'});


	await ctx.mob.save();
	await ctx.role.save();
}
