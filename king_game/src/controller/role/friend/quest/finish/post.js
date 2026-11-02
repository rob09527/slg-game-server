
'use strict'

module.exports = exports = async (ctx, next) =>{
	const {chapterid} = ctx.request.body;
	const c_config = global.gameconfig.fchapter.deepQueryOne('ID', parseInt(chapterid));
	ctx.assert(c_config, 'invalid chapterid');
	// chk record
	const cond = {rid: ctx.role._id, chapterid: c_config.ID};
	const record = await ctx.dao.fquest.findOne(cond);
	ctx.assert(record, 'not start');
	ctx.assert(Date.now() > record.start + c_config.MIN * 60 * 1000, 'not finish');
	let rewards = [];
	// reward
	for (const item of c_config.ITEMS) {
		const [min, max] = item.COUNT;
		rewards.push({
			GSID: item.GSID,
			COUNT: ctx.random.between(min, max),
		})
	}
	// drop
	for (const drop of c_config.DROPS) {
		const rate = drop.ITEMS.deepMap('W');
		for (let i = 0; i < drop.NUM; i++) {
			const index = ctx.random.inweight(rate);
			const item = drop.ITEMS[index];
			ctx.assert(item, 'invalid drop');
			rewards.push({
				GSID: item.GSID,
				COUNT: item.COUNT,
			})
		}
	}
	rewards = rewards.arrange();
	ctx.role.addItemsNoSave(rewards);
	const p = [record.remove(), ctx.role.save()];
	ctx.body = {rewards};
	// boss
	const isboss = ctx.random.hit(c_config.BOSSRATE, 1000);
	let boss = await ctx.dao.fboss.fetchBoss(ctx.role._id);
	if (isboss && !boss) {
		// find boss
		let bossid;
		for (const bid in global.gameconfig.fboss) {
			const {RANGE, MIN} = global.gameconfig.fboss[bid];
			const [min, max] = RANGE;
			if (ctx.role.level >= min && ctx.role.level <= max) {
				bossid = bid;
				break;
			}
		}
		ctx.assert(bossid, 'nin range');

		const udp = {
			bossid,
			start: Date.now(),
			totaldamges: 0,
			roles: [],
		}
		boss = ctx.dao.fboss.findOneAndUpdate({rid: ctx.role._id}, udp, {upsert: 1});
		p.push(boss);
		ctx.body.bossid = bossid;
	}
	await Promise.all(p);
}