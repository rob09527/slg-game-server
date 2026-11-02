
'use strict'

let {
	RESET_TIME_MARK,
	FREE_RESET_NUM,
	RESET_CAST,
} = global.gameconfig.others.TECH;

module.exports = exports = async (ctx, next) =>{
	// 检查免费次数是否可用
	let reset_times = ctx.role.getItems(RESET_TIME_MARK).count;
	if (reset_times < FREE_RESET_NUM) {
		ctx.role.addItemsNoSave(RESET_TIME_MARK);
	}else{
		ctx.role.castItemsNoSave(RESET_CAST, {main: 'tech', sec: 'reset'});
	}
	let {occu} = ctx.request.body;
	occu = parseInt(occu);
	const {tech} = ctx.role;
	const {legiontech} = global.gameconfig;
	let techids = [];
	for (const techid in legiontech) {
		const config = legiontech[techid];
		if (config.OCCU != occu) continue;
		techids.push(techid);
	}
	const items = [];
	for (const id of techids) {
		if (!ctx.role.tech[id]) continue;
		const config = legiontech[id];
		if (!config) continue;
		const {COST} = config;
		for (const gsid in COST) {
			const vals = COST[gsid];
			let total = 0;
			for (let i = 0; i < tech[id]; i++) {
				total += vals[i];
			}
			items.push({gsid: gsid, count: total});
		}
		ctx.role.tech[id] = 0;
		ctx.role.markModified('tech.'+id);
	}
	ctx.body = items.arrange();
	ctx.role.addItemsNoSave(ctx.body, {main: 'tech', sec: 'reset'});
	await ctx.role.save();
	ctx.body = {items: ctx.body};
}