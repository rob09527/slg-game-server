
'use strict'

module.exports = exports = async (ctx, next) =>{
	// todo chk mapid
	let {mapkey} = ctx.request.body;
	ctx.assert(mapkey, 'mapkey nexists');
	ctx.assert(mapkey.toString() === ctx.cache.refresh.toString(), 'invalid mapkey');

	let player = await ctx.role.getBattleSet('expedition');
	let {ZF_ADD} = global.gameconfig.others.EXPEDITION;
	for (let i = 0; i < ZF_ADD.length; i++) {
		let lv = ctx.cache.wish[i] || 0;
		let {ATTR, RATE = 0, NUM = 0} = ZF_ADD[i];
		let attr = ATTR.toLowerCase();
		for (let pos in player.team) {
			let general = player.team[pos];
			general.property[attr] = Math.floor((general.property[attr] || 0) * (1 + RATE * lv / 1000) + NUM * lv);
		}
	}
	for (const guid in ctx.cache.hp) {
		const hppercent = ctx.cache.hp[guid];
		for (const pos in player.team) {
			const general = player.team[pos];
			if (general.guid !== guid) continue;
			general.hppercent = hppercent;
		}
	}

	let battle = new ctx.dao.c_battle({
		rid: ctx.role._id,
		type: 'exped',
		player,
	})
	let index = ctx.role.getItems(90153).count;
	let {level, battleset: enemy} = ctx.cache.map[index];
	await battle.createEnemy(enemy);
	battle.season.right = level;
	await battle.save();
	ctx.body =  battle.base();
}
