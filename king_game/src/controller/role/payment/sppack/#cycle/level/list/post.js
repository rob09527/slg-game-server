
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.body = ctx.role.ssppack.level.map(function (cur, index) {
		if (!cur || cur.end < Date.now()) return null;
		const config = global.gameconfig.ssppacklevel[index];
		ctx.assert(config, 'invalid packindex');
		return {
			level: config.LEVEL, price: config.PRICE, items: config.ITEMS,
			end: cur.end, buytime: cur.bt,
		}
	}).filter(function (cur) {
		return cur;
	})
}