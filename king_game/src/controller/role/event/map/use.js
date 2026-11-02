
'use strict'

let city = global.gameconfig.city.deepQueryOne('ID', 104);
let last_chapter = city.CHAPTERS[city.CHAPTERS.length - 1];
let start_chapter_index = global.gameconfig.maplist.indexOf(last_chapter.toString());

module.exports = exports = async function (ctx, next) {
	// 移除过期的事件
	let types = [3, 4, 7];
	for (let type of types) {
		let timeouts = await ctx.dao.mapevent.find({rid: ctx.role._id, 'event.type': type});
		for (let event of timeouts) {
			let config = global.gameconfig['meventt'+type].deepQueryOne('ID', event.event.id);
			ctx.assert(config, 'invalid tid'+type);
			if (Date.now() < event.create + config.MIN * 60 * 1000) continue;
			await event.remove();
		}
	}
	ctx.hook.pre(EVENT_ENUM.WORLD_EVENT);
	ctx.assert(ctx.role._maxmapid > start_chapter_index, 'not open');
	await next();
}
