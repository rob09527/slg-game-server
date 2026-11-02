
'use strict'

module.exports = exports = async (ctx, next) =>{

	let {id} = ctx.request.body;

	let video = await ctx.dao.video.findOne({_id: id});
	ctx.assert(video, 'video nexist');

	let {rid, type, mark, time} = video;

	ctx.body = {
		owner: rid,
		type,
		mark,
		video: video.video,
		time,
		version: video.version,
	}
}