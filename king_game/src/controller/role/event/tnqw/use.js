
'use strict'
const tags = [ "tnqw", "sslx" ];

// 探囊取物（圣兽来袭）
module.exports = exports = async function (ctx, next) {
	let { tag = "tnqw" } = ctx.request.body;
	ctx.assert(tags.includes(tag), "invalid tag");
	ctx.tag = tag;
	let [start, end] = global.config.ZHD[ctx.tag.toUpperCase()] || [];
	ctx.assert(Date.in(start, end), 'fn freeze');
	// 计算当前总积分
	ctx.total_score = 0;
	let {
			SCORE,
	} = global.gameconfig.zhd[ctx.tag.toUpperCase()];
	for (let {MARK, LIMIT} of SCORE) {
		let cur = ctx.role.getItems(MARK).count;
		ctx.total_score += Math.min(cur, LIMIT);
	}
	await next();
}