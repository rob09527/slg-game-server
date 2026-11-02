/**
 * 追击
 */
'use strict'

module.exports = async ctx => {
	let {
		GENERALS,
		CAPTURE_RATE,
		CAPTURE_RATE_ZJ,
		ZJ_CAST
	} = ctx.config;
	ctx.assert(ctx.event.catchchance > 0, 'nomore chance');
	let rate = CAPTURE_RATE + CAPTURE_RATE_ZJ * (3 - ctx.event.catchchance + 1);
	// 俘虏次数减少1
	let $inc = {
		catchchance: -1,
	}
	if (ctx.free_surrender) { // 免费招降
		ZJ_CAST = null;
	}
	await ctx.event.updateOne({ $inc });
	ZJ_CAST && ZJ_CAST.length && ctx.role.castItemsNoSave(ZJ_CAST);
	ctx.event.catchchance--;
	if (ctx.random.hit(rate, 100)) {
		ctx.body.generals = GENERALS;
		// 生成俘虏数据
		let prisoners = GENERALS.map(gsid => {
			let config = global.gameconfig.surrender.deepQueryOne('GSID', gsid);
			if (!config) return;
			return {
				rid: ctx.role._id,
				servid: ctx.role.servid,
				gsid,
				loyal: config.LOYAL.BASE,
			}
		}).filter(Boolean);
		prisoners = await ctx.dao.prisoner.insertMany(prisoners);
	}
	ctx.body.castitems = ZJ_CAST;
	if (ZJ_CAST && ZJ_CAST.length) {
		await ctx.role.save();
	}
}
