
'use strict'

module.exports = exports = async (ctx, next) => {
	ctx.assert(ctx.exchange, 'preview nexists');
	ctx.general = await ctx.dao.general.findOne({ _id: ctx.exchange.general });
	if (!ctx.general) {
		await ctx.exchange.remove();
		ctx.exchange = null;
	}
	ctx.assert(ctx.exchange, 'preview nexists');
}    