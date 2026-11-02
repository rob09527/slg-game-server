
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {
		videoid,
	} = ctx.request.body;
	let video = await ctx.dao.video.findOne({_id: videoid});
	ctx.assert(video, 128);
	ctx.body = {
		video: video.video,
		version: video.version,
		time: video.time,
	}
}