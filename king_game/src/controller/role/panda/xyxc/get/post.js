
'use strict'
// 限时观星-幸运星辰
module.exports = exports = async function (ctx, next) {
	let file = "panda_xyxc" + ctx.FILEID;
	let config = global.gameconfig[file];
	ctx.assert(config , file + ' not find');
	let {
		XYXC = {FRONTEND: {NORMAL: [], PREMIUM: []}},
	} = { XYXC : config};
	 
	ctx.body = XYXC;
}