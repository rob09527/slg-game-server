
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.assert(!ctx.general.inherit || !ctx.general.inherit.prop || !ctx.general.inherit.prop.includes('exclusive'), 'exclusive lock'); //  继承，则不能操作
	ctx.hook.pre(EVENT_ENUM.GENER_MOUNT);
	await next();
}
