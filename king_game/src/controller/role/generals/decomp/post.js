
'use strict'

const moment = require('moment');

module.exports = exports = async (ctx, next) =>{
	ctx.hook.pre(EVENT_ENUM.RELIVE);
	let items = [];
	let awake_treasure_list = [];
	let book_list = [];
	let stone_list = [];
	let signet_list = [];
	let horse_list = [];
	let pet_list = [];
	const guids = ctx.request.body.arr || [];
	let logs = {};
	for (let guid of guids){
		let general = await ctx.dao.general.findOne({_id: guid});
		ctx.assert(general, 'general nexist');
		logs[guid] = [general.gsid, general.level, general.class];
		ctx.assert(general, 'general nexists');
		ctx.assert(!general.battleset.pvpdef, 'general inpvpdef');
		ctx.assert(!general.battleset.teampvp, 'general inpvpdef');
		items.append(general.material('DECOMP'));
		// 觉醒宝物
		if (general.treasure && general.treasure.length === 24) awake_treasure_list.push(general.treasure);
		// 兵书
		book_list.append(general.book || []);
		// 魂石
		stone_list.append(general.stone || []);
		//印记
		signet_list.append(general.signet || []);
		// 新坐骑
		horse_list.append(general.horse.guids || []);
		// 灵宠
		if(general.pet.guid) pet_list.push(general.pet.guid);

		// star reward when decomp
		let star = global.gameconfig.general[general.gsid].STAR;
		items = items.append(global.gameconfig.generaldecomp[star - 1]);
	}
	// 觉醒宝物
	let tmp = [];
	for (let _id of awake_treasure_list) {
		let at = await ctx.dao.awake_treasure.findOne({_id});
		if (!at) continue;
		tmp.push(at);
	}
	awake_treasure_list = tmp;
	// 兵书
	tmp = [];
	for (let book of book_list) {
		book = await ctx.dao.book.findOne({_id: book});
		if (!book) continue;
		tmp.push(book);
	}
	book_list = tmp;
	// 魂石
	tmp = [];
	for (let stone of stone_list) {
		let _stone = await ctx.dao.soulstone.findOne({_id: stone});
		if (!_stone) continue;
		tmp.push(_stone);
	}
	stone_list = tmp;

	// 印记
	tmp = [];
	for (let signet of signet_list) {
		let _signet = await ctx.dao.signet.findOne({_id: signet});
		if (!_signet) continue;
		tmp.push(_signet);
	}
	signet_list = tmp;

	// 新坐骑
	tmp = [];
	for (let horse of horse_list) {
		if(horse){
			let _horse = await ctx.dao.horse.findOne({_id: horse});
			if (!_horse) continue;
			tmp.push(_horse);
		}
	}
	horse_list = tmp;

	// 灵宠
	tmp = [];
	for (let pet of pet_list) {
		let _pet = await ctx.dao.pet.findOne({_id: pet});
		if (!_pet) continue;
		tmp.push(_pet);
	}
	pet_list = tmp;

	// 确认解散
	if (parseInt(ctx.request.body.type)) {
		let time = moment().format('YYYY-MM-DD HH:mm:ss');
		for (let guid of guids){
			await ctx.dao.general.remove({_id: guid});
			if (logs[guid]) {
				let [gsid, level, _class] = logs[guid];
				console.log('GENERAL', 'DECOMP', ctx.role.uid, guid, gsid, _class, level, time);
				ctx.role.notifyGeneralCost({
					type: 'decomp',
					gsid,
					gclass: _class,
					glevel: level,
				})
			}
		}
		// 移除觉醒宝物武将标记
		for (let at of awake_treasure_list) {
			await at.updateOne({$unset: {general: 1}});
		}
		// 移除兵书武将标记
		for (let book of book_list) {
			await book.updateOne({$unset: {general: 1}});
		}
		// 移除魂石武将标记
		for (let stone of stone_list) {
			await stone.updateOne({$unset: {general: 1}});
		}
		// 移除印记武将标记
		for (let signet of signet_list) {
			await signet.updateOne({$unset: {general: 1}});
		}
		// 移除新坐骑标记
		for (let horse of horse_list) {
            horse.owner = '';
            horse.pos = -1;
			await horse.updateOne({$set: {owner: '', pos: -1}});
		}
		// 移除灵宠
		for (let pet of pet_list) {
			pet.owner = '';
			await pet.updateOne({$set: {owner: ''}});
		}

		ctx.role.addItemsNoSave(items, {main: 'generals', sec: 'decomp'});
		ctx.role.missionInvoke('GENERAL_DECOMP', guids.length);
		ctx.role.dispatchEvent('EVENT_GENERAL_DECOMP' , guids.length);
		await ctx.role.save();
	}

	// ctx.dao.generalrank.removeRank(willRemove); // 遣散武将都是3星武将 不会达到140级，不会上榜
	ctx.body = items.arrange();
	// 觉醒宝物
	for (let at of awake_treasure_list) {
		at = await at.base();
		// 前端显示兼容
		at.count = 1;
		ctx.body.push(at);
	}
	// 兵书
	for (let book of book_list) {
		book = await book.base();
		book.count = 1;	// 前端显示兼容
		ctx.body.push(book);
	}
	// 魂石
	for (let stone of stone_list) {
		stone = await stone.base();
		stone.count = 1;	// 前端显示兼容
		ctx.body.push(stone);
	}

	// 印记
	for (let signet of signet_list) {
		signet = await signet.base();
		signet.count = 1;	// 前端显示兼容
		ctx.body.push(signet);
	}

	// 新坐骑
	for (let horse of horse_list) {
		horse = await horse.base();
		ctx.body.push(horse);
	}

	// 灵宠
	for (let pet of pet_list) {
		pet = await pet.base();
		ctx.body.push(pet);
	}
}
