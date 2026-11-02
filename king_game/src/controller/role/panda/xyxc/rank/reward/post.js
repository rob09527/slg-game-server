'use strict'



// 限时观星-观星榜单
module.exports = exports = async function (ctx, next) {
	let file = "panda_gxjl" + ctx.FILEID;
	let config = global.gameconfig[file];
	ctx.assert(config , file + ' not find');
	console.log(file,config)
	ctx.body = config;
}
	