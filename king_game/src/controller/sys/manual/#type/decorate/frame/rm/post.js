
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		frameid
	} = ctx.request.body;
	// 检查相框
	let exist = ctx.role._frames[frameid];
	ctx.assert(exist, 'frame nexist');
	// 清理相框
	let udp = {
		$unset: {
			['_frames.'+frameid]: 1,
		}
	}
	// 设置默认相框
	if (ctx.role.frameid === Number.parseInt(frameid)) {
		udp.$set = {
			frameid: 	51001,
		}
	}
	await ctx.role.updateOne(udp);
	ctx.body = {};
}