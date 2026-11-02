
'use strict'
// 登录赏令
module.exports = exports = async function (ctx, next) {
    let file = "panda_dlsl" + ctx.FILEID;
	ctx.assert(global.gameconfig[file] , file + ' not find');
    let config = global.gameconfig[file].client;
	ctx.assert(config , file + ' client not find');
	 
	ctx.body = config;
    ctx.body.time = ctx.endTime;
    ctx.body.id = ctx.FILEID;
    ctx.body.periods = global.gameconfig.panda[ctx.KEY.toUpperCase()].length;
    ctx.body.season = ctx.role.panda.dlsl.season + 1;
}