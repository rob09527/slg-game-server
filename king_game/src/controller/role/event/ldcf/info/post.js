'use strict'
// 信息查询
module.exports = exports = async function (ctx, next) {
	const { LDCF: {
		LIMIT: limit, GSID: gsid,
		PMARK, REWARDS: items,
		GRID: grid,
	} } = global.gameconfig.zhd;
	const count = ctx.role.getProp(PMARK);
	ctx.body = {
		gsid, limit, count,
		buytime: ctx.zhdpoint('LDCFREWARD', ctx.role),
		items,
		grid
	};
}