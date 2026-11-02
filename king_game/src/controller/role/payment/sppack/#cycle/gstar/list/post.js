
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.body = ctx.role.ssppack.gstar.map(function (cur, index) {
		if (!cur || cur.end < Date.now()) return null;
		const config = global.gameconfig.ssppackgstar[index];
		ctx.assert(config, 'invalid packindex');
		return {
			gstar: config.STAR, price: config.PRICE, items: config.ITEMS,
			end: cur.end, buytime: cur.bt,
		}
	}).filter(function (cur) {
		return cur;
	})
}