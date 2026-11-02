
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {
		mark,
		videolist,
		version,
	} = ctx.request.body;
	ctx.body = {};
	// 异步保存录像
	ctx.dao.video.create({
		type: 'teampvp',
		rid: ctx.team.i(),
		video: JSON.stringify(videolist),
		mark: mark.join('.'),
		version,
	}).catch(console.error);
}