
'use strict'

/* 向对应账号推送消息,跨服组调用可以废弃 */
module.exports = exports = async (ctx, next) =>{
	// TODO 可以废弃
	let {content, all} = ctx.request.body;
	ctx.assert(content, 'miss content');
	if(all){
		pushClientAll( content)
	} else {
		pushClient(ctx.role, content)
	}
	ctx.body = {
		message:  'OK'
	};
}
