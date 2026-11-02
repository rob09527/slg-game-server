
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		servid,
		type,
	} = ctx.request.body;
	let info = global.rank_cache[type];
	ctx.assert(info, 'invalid rank');
	ctx.body = info.cache;
}