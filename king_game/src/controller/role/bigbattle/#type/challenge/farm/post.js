
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.assert(ctx.record.last, 'challenge first');
	// 必须战胜的 boss 不能被 一件讨伐
	ctx.assert(!ctx.chapter.MUST_WIN, 'cant farm');

	let {times} = ctx.request.body;
	times = parseInt(times) || 1;
	let i = 0;
	for (; i < times; i++) {
		if (ctx.record.totaldamge >= ctx.chapter.BOSSHP) break;
		ctx.record.totaldamge += ctx.record.lastdamge;
	}
	ctx.times = i;
	if (ctx._enemy_type === 'mboss') {
		let free = ctx.chapter.COUNTLIMIT - ctx.role.getProp(ctx.chapter.REMARK);
		if (free > 0) {
			ctx.role.addItemsNoSave({GSID:ctx.chapter.REMARK, COUNT:free});
			i -= free;
		}
	}
	if (i > 0) {
		const cast = ctx.chapter.CAST || [{GSID: 30024, COUNT: 1}];
		ctx.role.castItemsNoSave(cast.map(c => ({GSID:c.GSID, COUNT: c.COUNT * i})));
	}
	ctx.body = {};
	if (ctx._enemy_type === 'mboss' && ctx.chapter.BOSSHP <= ctx.record.totaldamge) {//月度副本
		ctx.role.addItemsNoSave({GSID:90681, COUNT:1})
	}
}
