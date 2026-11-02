
'use strict'

// 幻兽攻城

module.exports = exports = async function (ctx, next) {
	const key = "hsgc";
	let [ok, season, id, start, etime] = ctx.role.isInPanda(key);
	ctx.assert(ok , key + ' not open');
	ctx.CONFIG = global.gameconfig[key];
	ctx.assert(ctx.CONFIG, 'invalid config');
	let d = ctx.role.panda[key];
	if (!d || d.id != id){
		ctx.role.panda[key] = {
			flag: {},			// 全服通关奖励已领取标记
			id,
			monster:[],
			stage:0,
			monsterNumber:0,
			monster_stage:-1,
		};
        ctx.save = true;
		let mark = [];
		let shop = ctx.CONFIG.shop[id];
		for (let stage in shop) {
			shop[stage].forEach(({MARK})=>{
				ctx.role.getProp(MARK) && mark.push({GSID:MARK, COUNT:0});
			})
		}
		mark.length && ctx.role.setItemsNoSave(mark);
	}
	ctx.CACHE = ctx.role.panda[key];
    ctx.etime = etime;
    ctx.FIELD = id;
    ctx.KEY = key;
	ctx.mongoFind = await ctx.dao.hsgc.findOne({servid: ctx.role.servid});
	if (!ctx.mongoFind) {
		let hour = parseInt((Date.now() - start) / 3600000);
		const FRESH = ctx.CONFIG.config.FRESH;
		hour = hour >= FRESH ? hour - parseInt(hour / FRESH) * FRESH : hour;

		ctx.mongoFind = await ctx.dao.hsgc.create({servid: ctx.role.servid, hour, id});
	}
	if (ctx.CACHE.monster_stage != ctx.mongoFind.monster_stage || ctx.CACHE.stage != ctx.mongoFind.stage) {
        ctx.CACHE.stage = ctx.mongoFind.stage;
		ctx.CACHE.monster.splice(0);
		ctx.CACHE.monster_stage = ctx.mongoFind.monster_stage;
		let map = ctx.CONFIG.map[ctx.CACHE.stage];
		ctx.assert(map,'137');
		let rolePower = ctx.role._power;
		let configPower = ctx.CONFIG.power;
		let power = 0;
		for (let _p in configPower) {
			power = parseInt(_p);
			if (rolePower < configPower[_p]) {
				break;
			}
		}
		for (let mapid in map) {
			if (map[mapid].includes(power)) {
				ctx.CACHE.monster.push(parseInt(mapid));
			}
		}
		while (ctx.CACHE.monster.length > ctx.CONFIG.config.NUMBER) {
			let pos = ctx.random.between(0, ctx.CACHE.monster.length);
			ctx.CACHE.monster.splice(pos, 1);
		}
		ctx.CACHE.monsterNumber = ctx.CACHE.monster.length;
        ctx.save = true;
	}

	await next();
    if (ctx.save) {
		ctx.role.markModified('panda.'+key);
        await ctx.role.save();
    }
}