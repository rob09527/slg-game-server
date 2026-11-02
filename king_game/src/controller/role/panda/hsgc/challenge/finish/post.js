
'use strict'

module.exports = exports = async (ctx) =>{
	let {battleid, mapid} = ctx.request.body;
    let pos = ctx.CACHE.monster.indexOf(parseInt(mapid));
	ctx.assert(pos > -1, "138");
    let reward = ctx.CONFIG.killReward[ctx.CACHE.stage];
	ctx.assert(reward, "129");
	reward = reward.filter(value=>{
		return value.RATE == 100 || Math.random() * 100 <= value.RATE;
	}).map(value=>{
		return {GSID:value.GSID, COUNT:value.COUNT}
	});

	let battle = await ctx.dao.c_battle.findOne({_id: battleid});
	ctx.assert(battle, 'invalid battleid');

	await battle.cal();
	ctx.body = {result: battle.result};
	if (battle.result.ret == 'win') {
		ctx.CACHE.monster.splice(pos,1);
		ctx.role.addItemsNoSave(reward);
		ctx.save = true;
		ctx.body.items = reward;
		ctx.mongoFind = await ctx.dao.hsgc.findOne({servid: ctx.role.servid});
		ctx.mongoFind.score += ctx.CONFIG.config.SCORE;
		if (!ctx.mongoFind.addStage && ctx.mongoFind.stage + 1 <= ctx.CONFIG.config.MAXSTAGE && ctx.mongoFind.score >= ctx.CONFIG.stageReward[ctx.mongoFind.stage + 1].SCORE) {
			ctx.mongoFind.stage++;
			ctx.mongoFind.addStage = true;
		}
		ctx.mongoFind.save();
	}
}
