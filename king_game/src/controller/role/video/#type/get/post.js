
'use strict'

module.exports = exports = async (ctx, next) => {
	let {
		num = 10,
		mark,
		nocontent,
	} = ctx.request.body;
	num = Number.parseInt(num);
	// 条件设置
	let condition = { rid: ctx.role._id, type: ctx.params.type };
	if (mark) condition.mark = mark;
	// 字段选择
	let select = { rid: 0, type: 0 };
	if (nocontent) select.video = 0;
	const videos = await ctx.dao.video.find(condition, select).sort({ _id: -1 }).limit(num);
	ctx.body = videos.map(({ _doc: { _id, __v, ...others } }) => {
		others.version = others.version || 202004081623;

		let data = {
			videoid: _id.toString(),
			...others
		};
		return {
			videoid: _id.toString(),
			...others
		};
	})
}