
'use strict'

const CS_CONDS = require('./../../../../util/cond');
const { hitHere } = require("../../../../util/weektarget");
const { smsHit } = require("../../../../util/event/smanskin");

const moment = require('moment');

module.exports = exports = async (ctx, next) =>{ 
	const target = ctx.request.body.targetid;
	const config = global.gameconfig.generalawake[target];
	ctx.assert(config, 'invalid target');
	ctx.assert(config.MAIN == ctx.general.gsid, 'main err');

	ctx.role.castItemsNoSave(config.ITEMS, {main: 'general', sec: 'awake'});
	let materials = ctx.request.body.materials || [];

	for (let i = 0; i < config.CONS.length; i++) {
		let cond = config.CONS[i];
		let m = materials[i] || [];
		ctx.assert(cond.COUNT == m.length, 'invalid len');
		for (let guid of m){
			let gen = ctx.role.destiny.general.find(value=>value && value.guid == guid);
			if (gen) {
				delete gen.guid;
				ctx.role.markModified('destiny.general');
			}
			let g = await ctx.dao.general.findOne({_id: guid});
			ctx.assert(g, 'general nexist');
			ctx.assert(!g.expireAt, 'will expire general'); // 限时武将不能做材料
			ctx.assert(!g.battleset.pvpdef, 'general inpvpdef');
			ctx.assert(!g.battleset.teampvp, 'general inpvpdef');
			let match = false;
			if (Array.isArray(cond.COND)) {
				match = cond.COND.every(function (c) {
					return CS_CONDS[c](g);
				})
			}else{
				match = g.gsid == cond.COND;
			}
			ctx.assert(match, 'not satisfi');
		}
	}

	materials = [].concat(...materials);
	let items = [];
	let awake_treasure_list = [];
	let book_list = [];
	let stone_list = [];// 魂石
	let signet_list = [];// 印记
	let horse_list = []; // 坐骑
	let pet_list = []; // 灵宠
	let logs = {};
	const flushRankForMaterials = [];
	for (let guid of materials){
		let g = await ctx.dao.general.findOne({_id: guid});
		logs[guid] = [g.gsid, g.level, g.class];
		flushRankForMaterials.push( {
			gsid: g.gsid,
			guid: guid,
			level: 1
		})
		items = items.concat(g.material('AWAKE'));
		// 记录觉醒宝物
		if (g.treasure && g.treasure.length === 24) {
			awake_treasure_list.push(g.treasure);
		}
		// 记录兵书
		book_list.append(g.book || []);
		// 记录魂石
		stone_list.append(g.stone || []);
		//记录印记
		signet_list.append(g.signet || []);
		// 新坐骑
		horse_list.append(g.horse.guids || []);
		// 灵宠
		if(g.pet.guid) pet_list.push(g.pet.guid);
	}
	ctx.role.addItemsNoSave(items, {main: 'general', sec: 'awake'});
	items = items.arrange().filter(({GSID, COUNT}) => COUNT > 0);
	ctx.general.gsid = parseInt(target);
	ctx.body = {
		castitems: config.ITEMS,
		items,
		general: ctx.general.base(),
	}
	ctx.role.addItemsNoSave({gsid: ctx.general.gsid, formark: 1});

	// 为了触发推荐礼包，增加角色
	ctx.role[`STAR_UP_${ctx.general.gsid}`] = 1;

	// 为了触发推荐礼包
	let {STAR: star} = global.gameconfig.general[ctx.general.gsid];
	if (star >= 5) {
		if (star > 5) {
			ctx.role["GROWUP_AWAKE"] = 1;
		}
		ctx.role[`GROWUP_STAR_${star}`] = star;
		ctx.role[`GROWUP_${ctx.general.gsid}`] = 1;  //武将突破，id确定了星级和资质
	}
	// 跑马灯
	ctx.role.bulletScreen("GEN_LVL", star, ctx.general.gsid);

	// 代言人皮肤活动埋点
	smsHit(ctx.role, ctx.general.gsid);
	ctx.role.missionInvoke('GENERAL_NUMSTAR_HISTORY', {gsid: ctx.general.gsid, count: 1});
	await ctx.role.zhenbaoMissionInvoke({missionName: 'STAR5GENERAL', generals: {gsid: ctx.general.gsid}});
	let curd = materials.map(function (guid) {
		return ctx.dao.general.remove({_id: guid});
	})
	await Promise.all(curd);

	// 更新觉醒宝物
	let _at_tmp = [];
	for (let at of awake_treasure_list) {
		at = await ctx.dao.awake_treasure.findOne({_id: at});
		if (!at) continue;
		// 移除武将标记
		await at.updateOne({$unset: {general: 1}});
		_at_tmp.push(at);
	}
	awake_treasure_list = _at_tmp;
	// 返回觉醒宝物数据
	for (let at of awake_treasure_list) {
		at = await at.base();
		// 前端显示兼容
		at.count = 1;
		ctx.body.items.push(at);
	}
	// 更新兵书
	let _book_tmp = [];
	for (let book of book_list) {
		book = await ctx.dao.book.findOne({_id: book});
		if (!book) continue;
		// 移除武将标记
		await book.updateOne({$unset: {general: 1}});
		_book_tmp.push(book);
	}
	for (let book of _book_tmp) {
		book = await book.base();
		book.count = 1;	// 前端显示兼容
		ctx.body.items.push(book);
	}
	// 更新魂石
	let _stone_tmp = [];
	for (let stone of stone_list) {
		let _stone = await ctx.dao.soulstone.findOne({_id: stone});
		if (!_stone) continue;
		// 移除武将标记
		await _stone.updateOne({$unset: {general: 1}});
		_stone_tmp.push(_stone);
	}
	for (let stone of _stone_tmp) {
		let _stone = await stone.base();
		_stone.count = 1;	// 前端显示兼容
		ctx.body.items.push(_stone);
	}

	// 更新印记
	let _signet_tmp = [];
	for (let signet of signet_list) {
		let _signet = await ctx.dao.signet.findOne({_id: signet});
		if (!_signet) continue;
		// 移除印记标记
		await _signet.updateOne({$unset: {general: 1}});
		_signet_tmp.push(_signet);
	}
	for (let signet of _signet_tmp) {
		let _signet = await signet.base();
		_signet.count = 1;	// 前端显示兼容
		ctx.body.items.push(_signet);
	}

	// 新坐骑
	for (let horseguid of horse_list) {
		if(horseguid){
			let _horse = await ctx.dao.horse.findOne({_id: horseguid});
			if (!_horse) continue;
			_horse.owner = '';
			_horse.pos = -1;
			await _horse.updateOne({$set: {owner: '', pos: -1}});

			let horse = await _horse.base();
			horse.count = 1;	// 前端显示兼容
			ctx.body.items.push(horse);
		}
	}

	// 灵宠
	for (let petguid of pet_list) {
		let _pet = await ctx.dao.pet.findOne({_id: petguid});
		if(_pet){
			_pet.owner = '';
			await _pet.updateOne({$set: {owner: ''}});

			let pet = await _pet.base();
			pet.count = 1;	// 前端显示兼容
			ctx.body.items.push(pet);
		}
	}

	// 七日目标-封神系统升星武将
	hitHere(ctx.role, 94211, 1, true);
	// print rm general
	let time = moment().format('YYYY-MM-DD HH:mm:ss');
	for (let [guid, [gsid, level, _class]] of Object.entries(logs)) {
		console.log('GENERAL', 'AWAKERM', ctx.role.uid, guid, gsid, _class, level, time);
		ctx.role.notifyGeneralCost({
			type: 'awake',
			gsid,
			gclass: _class,
			glevel: level,
		})
	}
	console.log('GENERAL', 'AWAKEDONE', ctx.role.servid, ctx.role.uid, config.MAIN, ctx.general.gsid, time);
	// 移除武将排行
	ctx.dao.generalrank.removeRank(flushRankForMaterials);
	// 额外打印武将消耗的日志
	for (let [, [ gsid ]] of Object.entries(logs)) {
		console.log(ctx.role.uid, ctx.role.rno, ctx.role.servid, 'CST', gsid, 1, time, -1, ctx.path);
	}
	await ctx.role.save();
	await ctx.general.save();
	// 更新bset
	ctx.general.updateBattleSet().catch(console.error);
	// 更新分数
	ctx.role.refreshCampScore().catch(console.error);
	ctx.general = null;
}
