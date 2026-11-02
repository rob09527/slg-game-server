
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.body = await ctx.dao.cdkey.find(ctx.request.body);
	ctx.body = ctx.body.map(doc =>{
		return doc.base();
	})
}