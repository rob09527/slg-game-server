
'use strict'

require('rx-apiwheel');

module.exports = exports = async (ctx, next) =>{

	const conf_general = global.gameconfig.general[ctx.general.gsid];
	ctx.assert(conf_general, 'invalid general');
	let config = global.gameconfig.exclusive[conf_general.EXCLUSIVE];
	ctx.assert(config, 'invalid exclusive');
	config = config[ctx.general.exclusive.level];
	ctx.assert(config, 'no more');

	let info = global.gameconfig.exclusivelevel[ctx.general.exclusive.level];
	ctx.assert(info, 'cant lvup');
	ctx.role.castItemsNoSave(info.ITEMS, {main: 'general', sec: 'exclulevel'});

	let lock = parseInt(ctx.request.body.lock);
	if (lock && info.LOCK) ctx.role.castItemsNoSave(info.LOCK, {main: 'general', sec: 'exclulevel'});

	let exist_len = ctx.general.exclusive.property.length;

	// attr
	for (let i = 0; i < config.PARR.length; i++){
		let pool = global.gameconfig.exclusiveword[config.PARR[i]];
		if (i < exist_len && lock) {
			// todo 更新数值
			let {key} = ctx.general.exclusive.property[i];
			let attr = pool.deepQueryOne('KEY', key.toUpperCase());
			ctx.general.exclusive.property[i].val = attr.VAL;
		}else{
			let attr = pool[ctx.random.inweight(pool.deepMap('W'))];
			ctx.general.exclusive.property[i] = {key: attr.KEY.toLowerCase(), val: attr.VAL};
		}
	}

	// skill
	exist_len = ctx.general.exclusive.skill.length;
	for (let i = 0; i < config.SARR.length; i++){
		if (i < exist_len && lock) continue;
		let pool = global.gameconfig.exclusiveskill[config.SARR[i]];
		let skill = pool[ctx.random.inweight(pool.deepMap('W'))];
		ctx.general.exclusive.skill[i] = skill.ID;
	}

	ctx.general.markModified('exclusive.skill');
	ctx.general.markModified('exclusive.property');
	ctx.general.exclusive.level++;

	await ctx.dao.c_excuattr.remove({general: ctx.general._id});
}
