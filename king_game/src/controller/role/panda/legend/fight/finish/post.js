
'use strict'

module.exports = exports = async (ctx) =>{
	let times = ctx.CACHE.day.times;
	let maxtimes = ctx.CONFIG.SETTING.NUM + ctx.CACHE.day.buy;
	assert(maxtimes > times, "error times");

	let {battleid} = ctx.request.body;
	let battle = await ctx.dao.c_battle.findOne({_id: battleid});
	ctx.assert(battle, 'invalid battleid');

	await battle.cal();
	ctx.body = {result: battle.result};

	let rankOne = false;
	ctx.CACHE.day.times = times + 1;
	ctx.CACHE.damage.all += battle.result.rlosthp;
	if(battle.result.rlosthp > ctx.CACHE.damage.one){
		rankOne = true;
		ctx.CACHE.damage.one = battle.result.rlosthp;
	}
	ctx.role.markModified('panda.cstz');
	// 任务
	let mission = [
		{ GSID: 97450, COUNT: 1 },	// 挑战次数
		{ GSID: 97451, COUNT: ctx.CACHE.damage.all - ctx.role.getItems(97451).count },	// 累积伤害
		{ GSID: 97452, COUNT: ctx.CACHE.damage.one - ctx.role.getItems(97452).count },	// 单次伤害
	];
	ctx.role.addItemsNoSave(mission);
	await ctx.role.save();

	let total = 0;
	let info = await ctx.dao.legend.findOne({season: ctx.CACHE.season, servid: ctx.role.servid});
	if(!info){
		total = ctx.CACHE.damage.all;
		let re = new ctx.dao.legend({damage: total, season: ctx.CACHE.season, servid: ctx.role.servid});
		await re.save();
	}
	else{
		total = info.damage + ctx.CACHE.damage.one;
		await ctx.dao.legend.updateOne({season: ctx.CACHE.season, servid: ctx.role.servid}, {$set:{damage:total}});
	}

	if(ctx.CACHE.damage.all > 0){
		let rankServiceAll = new global.services.RankService("legend-all-" + ctx.CACHE.season, ctx.role.servid); //应该改成ctx.role._gameserv.groupid
		await rankServiceAll.set({
			id: ctx.role.i(),
			score: ctx.CACHE.damage.all
		});
	}
	if(rankOne){
		let rankServiceOne = new global.services.RankService("legend-one-" + ctx.CACHE.season, ctx.role.servid); //应该改成ctx.role._gameserv.groupid
		await rankServiceOne.set({
			id: ctx.role.i(),
			score: ctx.CACHE.damage.one
		});
	}

	let day = {
		times: ctx.CACHE.day.times,
		buy: ctx.CACHE.day.buy,
		max: maxtimes
	}
	ctx.body.damage = ctx.CACHE.damage;
	ctx.body.total = total;
	ctx.body.day = day;
}
