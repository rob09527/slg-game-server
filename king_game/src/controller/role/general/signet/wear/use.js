
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.assert(ctx.general.signet,'not settlet')
    let {
		sguid
	} = ctx.request.body;
	ctx.signet = await ctx.dao.signet.findOne({_id: sguid});
	ctx.assert(ctx.signet, 'signet nexist');
    await next();
}
