
'use strict'

const { MAX_EVENT_NUM, REFRESH_INTERVAL_MIN, EVENT_TYPE_RATE } = global.gameconfig.eventdata;
const ref_interval_ms = REFRESH_INTERVAL_MIN * 60 * 1000;
const moment = require('moment');

module.exports = exports = async function (ctx, next) {
	const event_content = function (type, config) {
		let tmp = {};
		switch (parseInt(type)) {
			case 4: 	// 运气挑战事件
				let result = config.RATE.deepMap('R').map(function (rate) {
					return ctx.random.hit(rate);
				})
				tmp.roll = { time: 0, result };
				break;
			case 5: 	// 宝藏事件
				tmp.items = [];
				let pool = global.gameconfig.mepool[config.POOLID];
				for (let i = 0; i < 4; i++) {
					let tmppool = pool.filter(function (_, index) {
						return !tmp.items.includes(index);
					})
					let rate = tmppool.deepMap('W');
					let item = tmppool[ctx.random.inweight(rate)];
					tmp.items.push(pool.indexOf(item));
				}
				tmp.items = tmp.items.map(function (index) {
					return pool[index];
				})
				break;
		}
		return tmp;
	}
	const init_event = async function (stations) {
		let _config = global.gameconfig.meventinit; // init_config
		let init_events = [];
		let need_events = [];
		for (let c of _config) {
			let e_config = global.gameconfig[`meventt${c.TYPE}`].deepQueryOne('ID', parseInt(c.TID));
			if (!e_config) continue;
			// create init
			let obj = event_content(c.TYPE, e_config);
			obj.rid = ctx.role._id;
			obj.event = {
				type: c.TYPE,
				id: e_config.ID
			};
			init_events.push(obj);
		}
		// 添加需要位数的stations
		if (init_events.length > 0) {
			let new_stations = stations.splice(0, init_events.length);
			for (let i = 0; i < init_events.length; i++) {
				init_events[i].stationid = new_stations[i];
				let doc = await ctx.dao.mapevent.create(init_events[i]);
				need_events.push(doc);
			}
		}
		return { need_events, stations };
	}

	let events = await ctx.dao.mapevent.find({ rid: ctx.role._id });
	let isfirst = false;
	if (events.length == 0) isfirst = true; // 通过判断mapevent的数据判断是否是首次
	// 计算需要刷的事件个数
	let ref_num = Math.trunc((Date.now() - ctx.role.mapevent.last) / ref_interval_ms);
	// 事件是否已满
	let del = MAX_EVENT_NUM - events.length;
	if (del > 0 && ref_num > 0) {
		ctx.role.mapevent.last += ref_num * ref_interval_ms;
		ref_num = Math.min(del, ref_num);
		// 筛选可用节点
		let stations = [];
		for (let { ID, CHAPTERS, EIDS } of global.gameconfig.city) {
			let last_chapter = CHAPTERS[CHAPTERS.length - 1];
			let index = global.gameconfig.maplist.indexOf(last_chapter.toString());
			if (index >= ctx.role._maxmapid) break;
			stations.append(EIDS);
		}
		// 排除
		stations = stations.filter(function (id) {
			let exist = events.deepQuery('stationid', id);
			return exist.length < 1;
		});
		let mapevent_type7 = [];
		if (stations.length > 0) {	// 有节点可用
			// 随机生成
			stations.shuffle();
			// init mapevent
			if (isfirst && ctx.role.getProp(90617) == 0) {
				// 首次init初始化事件
				let { need_events, stations: newstations } = await init_event(stations);
				// 剩余节点赋值
				stations = newstations;
				events.append(need_events);
			}
			stations = stations.slice(0, ref_num).map(async function (sid) {
				let { EVENTTYPE: type } = global.gameconfig.mapevent[sid];
				let rate = type.map(function (t) {
					return EVENT_TYPE_RATE[t];
				})
				type = type[ctx.random.inweight(rate)];
				// 根据类型生成事件
				let config = global.gameconfig['meventt' + type];
				if (!config) {
					console.error('invalid metype', type);
					return null;
				}
				if (type == 1) { // 武将偶遇增加出现等级判断
					config = config.filter(({ APPEAR }) => APPEAR <= ctx.role.level);
				}
				if (type == 7) { // 巡逻事件,终生一次
					config = config.filter(({ ID, DAY }) => {
						// 是否满足时间条件
						let startDay = moment(ctx.role.create).startOf('days').valueOf();
						let day = Date.now() > moment(startDay).add(DAY, 'day').valueOf() ? true : false
						return ctx.role.mapevent.list && !ctx.role.mapevent.list.includes(ID) && day;
					});
				}
				rate = config.deepMap('W');
				config = config[ctx.random.inweight(rate)];

				if (!config) {
					console.error('invalid event', type);
					return null;
				}
				// 巡逻事件做一层保护,避免单次请求随机到相同的事件
				if (type == 7 && mapevent_type7.includes(config.ID)) return null;
				if (type == 7) mapevent_type7.push(config.ID)

				let doc = event_content(type, config);
				doc.rid = ctx.role._id;
				doc.stationid = sid;
				doc.event = {
					type,
					id: config.ID
				}
				doc = await ctx.dao.mapevent.create(doc);
				events.push(doc);
			})
			await Promise.all(stations);
			// 处理老数据,刷新事件时添加上标记
			if (ctx.role.getProp(90617) == 0) ctx.role.addItemsNoSave(90617);
			if (mapevent_type7.length > 0) {
				ctx.role.mapevent.list = ctx.role.mapevent.list || [];
				// 巡逻事件触发一次,已经出现的事件则添加记录,避免下次触发;
				ctx.role.mapevent.list.append(mapevent_type7);
				// 去重存储
				ctx.role.mapevent.list = Array.from(new Set(ctx.role.mapevent.list));
				ctx.role.markModified('mapevent');
			}
			await ctx.role.save();
		}
	}
	const list = events.map(function (doc) {
		return doc.base();
	}).reduce(function (cur, nxt) {
		let stationid = nxt.id;
		delete nxt.id;
		cur[stationid] = nxt;
		return cur;
	}, {});

	ctx.body = {
		list,
		max: MAX_EVENT_NUM,
		next: ctx.role.mapevent.last + ref_interval_ms // 返回下一次产生事件的时间
	}
}
