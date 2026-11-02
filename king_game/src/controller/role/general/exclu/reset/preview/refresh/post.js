
'use strict'

module.exports = exports = async (ctx, next) =>{

	const conf_general = global.gameconfig.general[ctx.general.gsid];
	ctx.assert(conf_general, 'invalid gsid');
	const config = global.gameconfig.exclusive[conf_general.EXCLUSIVE][ctx.general.exclusive.level-1];
	const reset = global.gameconfig.exclusivereset[ctx.general.exclusive.level - 1];
	ctx.assert(config && reset, 'no more');

	ctx.role.castItemsNoSave(reset.ITEMS, {main: 'general', sec: 'exclureset'});
	
	if (!ctx.preview) ctx.preview = new ctx.dao.c_excuattr({general: ctx.general._id});

	ctx.preview.property = ctx.general.exclusive.property;
	ctx.preview.skill = ctx.general.exclusive.skill;

	let lock = parseInt(ctx.request.body.ltype);
	if (lock == 1) ctx.role.castItemsNoSave(reset.ATTR, {main: 'general', sec: 'exclureset'});
	if (lock == 2) ctx.role.castItemsNoSave(reset.SKILL, {main: 'general', sec: 'exclureset'});
	// attr
	if (lock != 1) {
		let tmp = [];
		for (let id of config.PARR){
			let pool = global.gameconfig.exclusiveword[id];
			let attr = pool[ctx.random.inweight(pool.deepMap('W'))];
			tmp.push({key: attr.KEY.toLowerCase(), val: attr.VAL});
		}
		ctx.preview.property = tmp;
	}
	// skill
	if (lock != 2) {
		let tmp = [];
		for (let id of config.SARR){
			let pool = global.gameconfig.exclusiveskill[id];
			let skill = pool[ctx.random.inweight(pool.deepMap('W'))];
			tmp.push(skill.ID);
		}
		ctx.preview.skill = tmp;
	}
	await ctx.preview.save();
}