
'use strict'

// 古迹寻宝

const event_info = function(ctx, event){
	let info = {};
	if (event.type == 1){ // 战斗事件
		const file = 'panda_gjxb_fight'+ctx.FILEID;
		const cfg = global.gameconfig[file];
		const config = cfg[event.id];
		info.rare = config.rare;
		info.desc = config.desc;
		info.icon = config.icon;
		info.power = config.power;
		const fight = 'battle'+'gjxb'+ctx.FILEID;
		const config2 = global.gameconfig[fight];
		info.monster = config2[event.id];
	} else if (event.type == 2){ // 宝箱事件
		const file = 'panda_gjxb_box'+ctx.FILEID;
		const cfg = global.gameconfig[file];
		const config = cfg[event.id];
		info.rare = config.rare;
	} else if (event.type == 3){ // 挖宝事件
		const file = 'panda_gjxb_treasure'+ctx.FILEID;
		const cfg = global.gameconfig[file];
		const config = cfg[event.id];
		info.rare = config.rare;
	} else if (event.type == 4){ // 选择事件
		const file = 'panda_gjxb_select'+ctx.FILEID;
		const cfg = global.gameconfig[file];
		const config = cfg[event.id];
		info.rare = config.rare;
		info.desc = config.desc;
		info.icon = config.icon;
		info.sel = config.sel;
		info.items = [];
		for (const item of config.items) {
			info.items.push(item.GSID);
		}
	} else if (event.type == 5){ // 答题事件
		const file = 'panda_gjxb_answer'+ctx.FILEID;
		const cfg = global.gameconfig[file];
		const config = cfg[event.id];
		info.rare = config.rare;
		info.desc = config.desc;
		info.icon = config.icon;
		info.answer = config.answer;
		info.correct = config.correct;
	}
	return info;
}

const trigger_event = function(ctx, times, map_config){
	let events = [];
	let event_num = ctx.CACHE.base.event || 0;
	if(event_num < ctx.CONFIG.base.EVENT_MAX){
		const file = 'panda_gjxb_event'+ctx.FILEID;
		const event_group = global.gameconfig[file];
		const event_config = event_group[map_config.GROUP];
		const now = Date.now();
		for(let i = 0; i < times; ++i){
			if(Math.floor(Math.random() * 10000) <= map_config.ODDS){
				const eventid = now + i;
				const event = event_config.EVENT[ctx.random.inweight(event_config.EVENT.deepMap('W'))];
				let data = {
					id: event.ID,
					type: Math.floor(event.ID/1000),
					map: map_config.ID
				}
				ctx.CACHE.event[eventid] = data;
				let info = {
					key: eventid,
					id: data.id,
					type: data.type,
					info: event_info(ctx, data)
				}
				events.push(info);
				event_num++;
			}
			if(event_num >= ctx.CONFIG.base.EVENT_MAX) break
		}
	}
	ctx.CACHE.base.event = event_num;
	return events
}

module.exports = exports = async function (ctx, next) {
	let [ok, season, id] = ctx.role.isInPanda('GJXB');
	ctx.assert(ok , 'gjxb not open');
	const key = 'gjxb';
	let d = ctx.role.panda[key];
	if (!d || d.season != season){
		ctx.role.panda[key] = {
			season,
			base: {},		// 基础数据
			event: {},		// 事件
			shop: {},		// 礼包
			fund: {},		// 基金
		};

		ctx.role.markModified('panda');
		await ctx.role.save();
	}
	ctx.CACHE = ctx.role.panda[key];
	ctx.FILEID = id;
	const file = 'panda_gjxb'+ctx.FILEID;
	ctx.CONFIG = global.gameconfig[file];
	ctx.assert(ctx.CONFIG , 'gjxb config');
	ctx.TRIGGER_EVENT = trigger_event;
	ctx.EVENT_INFO = event_info;
	await next();
	delete ctx.TRIGGER_EVENT;
	delete ctx.EVENT_INFO;
}