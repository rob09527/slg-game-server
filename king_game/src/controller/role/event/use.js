
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.zhdinfo = require('./../../../util/zhdinfo')
	ctx.zhdreward = require('./../../../util/zhdreward')
	ctx.zhdprint = function(type, ...others) {
		ctx.khlog.zhdprint(type, ctx.role, ...others)
	}
	ctx.lowerGsid = items => items.map(({ GSID, COUNT }) => ({ gsid: GSID, count: COUNT }));
	await next()
}