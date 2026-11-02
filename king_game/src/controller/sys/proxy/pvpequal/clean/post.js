
'use strict'

const {
	PVPEQUAL: {
		CLEANMARK,
	}
} = global.gameconfig.others;

module.exports = exports = async function (ctx, next) {
	// 清空信息
	await ctx.dao.equalinfo.remove({});
	// 清空标记
	let $unset = {};
	for (let mark of CLEANMARK) {
		$unset[`others.${mark}`] = 1;
	}
	await ctx.dao.role.updateMany({}, {$unset});
	// 异步删除录像
	ctx.dao.video.remove({type: 'pvpequal'}).catch(console.error);
}