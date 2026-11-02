
'use strict'

module.exports = exports = async (ctx, next) =>{
	let castitems = [
		{gsid: 38005, count: 20},
	]
	ctx.role.castItemsNoSave(castitems);
	let awake_treasure = ctx.general.treasure;
	// 获取觉醒宝物,并移除武将标记
	if (awake_treasure && awake_treasure.length === 24) {
		awake_treasure = await ctx.dao.awake_treasure.findOne({_id: awake_treasure});
		await awake_treasure.updateOne({$unset: {general: 1}});
	}

	let items = ctx.general.material('RESET');
	ctx.general.level = 1;
	ctx.general.class = 0;
	ctx.general.treasure = undefined;
	ctx.general.equip = [];
	
	// 移除这个武将的排行信息
	ctx.dao.generalrank.removeRank([
		{
			guid: ctx.general._id.toString(),
			gsid:  ctx.general.gsid,
			level: 1
		}
	]);
	ctx.role.addItemsNoSave(items, {main: 'general', sec: 'reset'});
	ctx.role.missionInvoke('GENERAL_RESET_HISTORY');
	ctx.body = {
		items,
		castitems,
	}
	// 返回觉醒武将数据
	if (awake_treasure && typeof awake_treasure === 'object') {
		awake_treasure = await awake_treasure.base();
		// 前端显示兼容
		awake_treasure.GSID = awake_treasure.gsid;
		awake_treasure.count = 1;
		ctx.body.items.push(awake_treasure);
	}
	// 返回兵书
	for (let b of ctx.general.book) {
		b = await ctx.dao.book.findOne({_id: b});
		if (!b) continue;
		await b.updateOne({$unset: {general: 1}});
		b = await b.base();
		b.count = 1;	// 前端显示兼容
		ctx.body.items.push(b);
	}
	// 返回魂石
	for (let s of ctx.general.stone) {
		s = await ctx.dao.soulstone.findOne({_id: s});
		if (!s) continue;
		await s.updateOne({$unset: {general: 1}});
		s = await s.base();
		s.count = 1;	// 前端显示兼容
		ctx.body.items.push(s);
	}
	// 返回新坐骑
	const {SET_ON} = global.gameconfig.horsesetting;
	for(let i = 0; i < SET_ON; ++i ){
		let guid = ctx.general.horse.guids[i]
		if(guid){
			let horse = await ctx.dao.horse.findOne({_id: guid});
			if(horse){
				horse.owner = '';
				horse.pos = -1;
				await horse.updateOne({$set: {owner: '', pos: -1}});
				horse = await horse.base();
				horse.count = 1;	// 前端显示兼容
				ctx.body.items.push(horse);
			}
		}
	}
	// 返回灵宠
	let petguid = ctx.general.pet.guid;
	if(petguid){
		let pet = await await ctx.dao.pet.findOne({_id: petguid});
		if(pet){
			pet.owner = '';
			await pet.updateOne({$set: {owner: ''}});
			pet = await pet.base();
			pet.count = 1;	// 前端显示兼容
			ctx.body.items.push(pet);
		}
	}
	ctx.general.book = [];
	ctx.general.markModified('book');
	ctx.general.stone = [];
	ctx.general.markModified('stone');
	ctx.general.horse.guids = [];
	ctx.general.markModified('horse');
	ctx.general.pet.guid = '';
	ctx.general.markModified('pet');
	// 清空计算用的兵书对象
	ctx.general._book_ = [];
	// 清空计算用的魂石对象
	ctx.general._stone_ = [];
	// 清空新坐骑
	ctx.general._horse_ = [];
	// 清空灵宠
	ctx.general._pet_ = undefined;
	// 返回武将数据
	ctx.body.general = ctx.general.base();
}
