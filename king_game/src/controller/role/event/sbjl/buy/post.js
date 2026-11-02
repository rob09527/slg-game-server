
'use strict'
const CS_CONDS = require('./../../../../../util/cond');
// 神兵降临-兑换
module.exports = exports = async function (ctx, next) {
	let { index, materials } = ctx.request.body;
	index = parseInt(index);
	let { SBJL: config } = global.gameconfig.zhd;
	config = config[index];
	ctx.assert(config, 'invalid index');
	let { LIMIT, COST, ITEMS, CONS } = config;
	let bought = ctx.role.sbjl[index] || 0;
	ctx.assert(bought < LIMIT, 'no more');
	// 判断材料是否满足条件
	for (let i = 0; i < CONS.length; i++) {
		let cond = CONS[i];
		let m = materials[i] || [];
		ctx.assert(cond.COUNT == m.length, 'invalid len');
		for (let guid of m) {
			let g = await ctx.dao.general.findOne({ _id: guid });
			ctx.assert(g, 'general nexist');
			ctx.assert(!g.battleset.pvpdef, 'general inpvpdef');
			ctx.assert(!g.battleset.teampvp, 'general inpvpdef');
			let match = false;
			if (Array.isArray(cond.COND)) {
				match = cond.COND.every(function (c) {
					return CS_CONDS[c](g);
				})
			} else {
				match = g.gsid == cond.COND;
			}
			ctx.assert(match, 'not satisfi');
		}
	}
	// 扣除置换的材料
	materials = materials.reduce(function (cur, guids) {
		return cur.concat(guids);
	}, []);
	// 返还的材料
	let items = [];
	for (let guid of materials) {
		let g = await ctx.dao.general.findOne({ _id: guid });
		items = items.concat(g.material('DECOMP'));
		// 星级对应的返还材料
		let star = global.gameconfig.general[g.gsid].STAR;
		items = items.append(global.gameconfig.generaldecomp[star - 1]);
	}
	ctx.role.addItemsNoSave(items);
	// 移除被置换的武将
	for (let guid of materials) {
		await ctx.dao.general.remove({ _id: guid });
	}
	// 有额外扣的配置额外扣
	ctx.role.castItemsNoSave(COST);
	// 给奖励
	ctx.role.addItemsNoSave(ITEMS);
	ctx.role.sbjl[index] = ++bought;
	ctx.role.markModified('sbjl');
	await ctx.role.save();
	ctx.body = {
		reward: ITEMS,
		items,
		castitems:COST
	};
	// 周活动日志-神兵降临
	ctx.zhdprint("sbjl", index);
}