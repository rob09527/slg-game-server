
'use strict'

const {MAX_EVENT_NUM} = global.gameconfig.eventdata;
const { hitHere } = require("../../../../../util/weektarget");

module.exports = exports = async function (ctx, next) {
	let {
		id: stationid,
		hash,
		data = {}
	} = ctx.request.body;
	let event = await ctx.dao.mapevent.findOne({rid: ctx.role._id, stationid});
	ctx.assert(event, 'event nexist');
	ctx.assert(event._id.toString() === hash, 'verify fail');
	let {event: {type, id}} = event;
	let config = global.gameconfig['meventt'+type];
	ctx.assert(config, 'invalid etype');
	config = config.deepQueryOne('ID', id);
	ctx.assert(config, 'invalid eid');
	ctx.body = {reward: []};
	let is_remove = true;
	switch(type) {
		case 3: {	// 商人
			let { index = 0, giveup = 0 } = data;
			if (parseInt(giveup) === 1) break; // 放弃商人事件
			let {ITEMS} = config;
			let {ADD, CAST} = ITEMS[parseInt(index)];
			ctx.role.castItemsNoSave(CAST);
			ctx.role.addItemsNoSave(ADD);
			ctx.body.reward = ADD;
			break;
		}
		case 4: {	// 运气挑战
			let {giveup = 0} = data;
			if (parseInt(giveup) == 1) break;	// 放弃运气挑战
			let {result, time} = event.roll;
			let cast_rate = config.RATE.reduce((cur, {A}, index) =>{
				if (time > index) cur = cur * A;
				return cur;
			}, 1);
			let out = config.CAST.map(function ({GSID, COUNT}) {
				return {GSID, COUNT: COUNT * cast_rate};
			})
			ctx.role.castItemsNoSave(out);
			if (!result[time]) {
				ctx.body.ret = 2;
				break;
			}
			await event.updateOne({$inc: {'roll.time': 1}});
			event.roll.time++;
			ctx.body.ret = 1;
			let out_rate = config.RATE.reduce((cur, {A}, index) =>{
				if (event.roll.time > index) cur = cur * A;
				return cur;
			}, 1)
			out = config.CAST.map(function ({GSID, COUNT}) {
				return {GSID, COUNT: COUNT * out_rate};
			})
			ctx.role.addItemsNoSave(out);
			ctx.body.reward = out;
			if (event.roll.time < 3) is_remove = false;
			break;
		}
		case 5: {	// 宝藏
			let { giveup = 0 } = data;
			if(parseInt(giveup) === 1) break; // 放弃宝藏事件
			let rate = event.items.deepMap('W');
			let {GSID, COUNT} = event.items[ctx.random.inweight(rate)];
			let out = {GSID, COUNT: ctx.random.between(COUNT[0], COUNT[1])};
			ctx.role.addItemsNoSave(out);
			// 扣
			ctx.role.castItemsNoSave(config.CAST);
			ctx.body.reward.push(out);
			break;
		}
		case 1: { // 武将
			// 检查是否已战斗
			ctx.assert(event.battlewin !== undefined, 'battle unfinish');
			let items = event.battlewin? config.WIN_ITEMS: config.LOST_ITEMS;
			ctx.role.addItemsNoSave(items);
			ctx.body.reward = items;
			break;
		}
		case 7: { // 巡逻事件
			// 奖励下标
			let { index = 0 } = data;
			ctx.assert(index >= 0,'invalid index');
			let {ITEMS,ID} = config;
			ctx.assert(ITEMS[index],'invalid items');
			ctx.role.addItemsNoSave(ITEMS[index]);
			ctx.body.reward = ITEMS[index];
			break;
		}
		default: { // todo
			let {opt = 0} = data;
			let items = config.ITEMS[parseInt(opt)].map(function ({GSID, COUNT, R}) {
				let count = COUNT;
				if (Array.isArray(count)) count = ctx.random.between(count[0], count[1]);
				if (R) count += ctx.role.level * R;
				return {gsid: GSID, count};
			});
			ctx.role.addItemsNoSave(items);
			ctx.body.reward = items;
		}
	}
	let event_num = await ctx.dao.mapevent.find({rid: ctx.role._id}).countDocuments();
	if (event_num >= MAX_EVENT_NUM && is_remove) {
		ctx.role.mapevent.last = Date.now();
	}
	ctx.role.markModified('mapevent');
	// 七日目标-完成征战事件次数
	ctx.zhdpoint('ZJD_POINT',ctx.role,98303); //欢乐砸金蛋-完成征战事件1次
	hitHere(ctx.role, 94207, 1, true);
	await ctx.role.save();
	if (is_remove) await event.remove();
}
