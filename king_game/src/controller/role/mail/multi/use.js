
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.mails = [];
	ctx.mails = await ctx.dao.mail.find({_id: {$in: ctx.request.body.arr}});

	ctx.assert(ctx.mails.length > 0, 'no mail');
	await next();
	if (!ctx.body) ctx.body = {};
}
