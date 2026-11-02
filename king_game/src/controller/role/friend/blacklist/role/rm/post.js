
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.assert(ctx.record, 'nin blacklist');
	await ctx.record.remove();
	ctx.body = {};
}