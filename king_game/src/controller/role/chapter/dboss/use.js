
'use strict'

/**
 * @deprecated 旧的征战 boss 废弃
 * @type {function(*, *): Promise<void>}
 */
module.exports = exports = async (ctx, next) =>{
	let {id} = ctx.request.body;
	assert.fail('deprecated')
	await next();
}
