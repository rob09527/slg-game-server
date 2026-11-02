
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {
		video
	} = ctx.request.body;
	if (typeof video !== 'string') ctx.request.body.video = JSON.stringify(ctx.request.body.video);
	ctx.request.body.rid = ctx.role._id;
	// 异步保存录像
	ctx.dao.video.create(ctx.request.body).catch(console.error);
	ctx.body = {};
}