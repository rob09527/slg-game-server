
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.assert(ctx.params.type, 'invalid activity type');
    let key = ctx.params.type;
	if(key == 'cpjf' || key == 'cpjf2') {
		ctx.hook.pre(EVENT_ENUM.ACTIVITY_ZHD_XUNBAO);
		key = ctx.role.isXS('xs_'+key) ? 'xs_'+key: key;
	}	
	ctx.KEY = key.toUpperCase();
	if(key == 'xs_cpjf' || key == 'xs_cpjf2') 	ctx.KEY = ctx.role.isXS(key) ? ctx.role.isXSConKey(key).toUpperCase():key.toUpperCase();
	ctx.config = global.gameconfig.zhd[ctx.KEY];
	ctx.assert(ctx.config , 'fn freeze');
	ctx.assert(ctx.zhdpoint("ISZHD", key) , 'fn freeze');
	await next();
}
