
'use strict'

// 招募

// 招募次数ID
const NUMTYPE = {
    "NORMAL": 90348
}

const randinpool = function (quality = 1) {
	const pets = global.gameconfig.petitem.filter(function (p) {
		return p.QUALITY == quality;
	})
	let rates = pets.deepMap('CHANCE');
	const getIndex = ctx.random.inweight(rates);
	let pet = pets[getIndex];
	ctx.assert(pet, 'invalid pet');
	return {...pet};
}

module.exports = exports = async (ctx, next) =>{

	const type = "NORMAL";
	const times = parseInt(ctx.request.body.times) || 1;
	const rates_quality = global.gameconfig.petrecruititem[type];
	const num_id = NUMTYPE[type];

	const {NUM,FREE,COST} = global.gameconfig.petsetting;
	const CUR = ctx.role.getItems(num_id).count;
	ctx.assert(CUR < NUM, 'no num');
	let cost_num = times;
	if(FREE > CUR)  cost_num = cost_num - FREE + CUR;
	let castitems = [];
	if(cost_num > 0) {
		for(let i = 0; i < COST.length; i++){
			let cost = {};
			cost.GSID = COST[i].GSID;
			cost.COUNT = COST[i].COUNT * cost_num;
			castitems.push(cost);
		}
		ctx.role.castItemsNoSave(castitems);
	}

	let out = [];
	for (let i = 0; i < times; i++) {
		// 品质指定
		let quality = ctx.random.inweight(rates_quality) + 1;
		ctx.assert(quality >= 1 && quality <= 5, 'random err');
		out.push(randinpool(quality));
	}
	out.shuffle(); // 洗牌一次 避免看起来很假

	type = type.toLowerCase();
	out = out.map(function (p) {
		return {gsid: p.GSID, count: 1, reason: `recruit_pet_${type}`};
	})
	out.push({gsid: num_id, count: times})
	ctx.role.addItemsNoSave(out);

	const newpet = [].append(ctx.role.newpet);
	const pets = newpet.map(function (doc) {
		doc._role = ctx.role;
		return doc.base();
	});
	await ctx.role.save();
	ctx.body = {
		pets: pets,
		castitems: castitems
	};
}
