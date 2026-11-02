
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.event = await ctx.dao.cjevent.find({rid: ctx.role._id}).sort({step: -1});
	ctx.event = ctx.event[0];
	if (!ctx.event || ctx.event.finish) {
		let step = ctx.event? ctx.event.step + 1: 0;
		let config = global.gameconfig.ns2020.STEP[step];
		ctx.assert(config, 'no more');
		if (config) {
			ctx.event = new ctx.dao.cjevent({rid: ctx.role._id, step});
			if (config.POS) {
				if (config.POS != 1) {
					ctx.event.pos = config.POS;
				}else{
					// 查找可用节点
					let stations = [];
					for (let {ID, CHAPTERS, EIDS} of global.gameconfig.city) {
						let last_chapter = CHAPTERS[CHAPTERS.length - 1];
						let index = global.gameconfig.maplist.indexOf(last_chapter.toString());
						if (index >= ctx.role._maxmapid) break;
						stations.append(EIDS);
					}
					let lastpos = await ctx.dao.cjevent.find({rid: ctx.role._id, pos: {$exists: 1}}).sort({step: -1});
					lastpos = lastpos[0] || {};
					lastpos = lastpos.pos || 1;
					if (ctx.event) {
						stations = stations.filter(pos =>{
							return pos != ctx.event.pos;
						})
					}
					ctx.event.pos = stations[ctx.random.between(0, stations.length - 1)];
				}
			}
			if (config.TYPE == 3) {
				ctx.event.boss = {
					lastdamge: 0,
					totaldamge: 0,
				}
			}
			await ctx.event.save();
		}
	}
	ctx.assert(ctx.event, 'invalid event');
	let config = global.gameconfig.ns2020.STEP[ctx.event.step];
	ctx.assert(config, 'invalid step');
	let {MID, TYPE} = config;
	ctx.eventtype = TYPE;
	ctx.mid = MID;
	config = global.gameconfig.ns2020['MTYPE'+TYPE];
	ctx.assert(config, 'invalid type');
	config = config[MID];
	ctx.assert(config, 'invalid mid');
	ctx.config = config;
	await next();
}