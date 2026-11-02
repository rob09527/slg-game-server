
'use strict'

let {
	RESET_TIME_MARK,
	FREE_RESET_NUM,
	RESET_CAST,
} = global.gameconfig.others.MYTHICAL;

module.exports = exports = async (ctx, next) =>{
	// 检查免费次数是否可用
	let reset_times = ctx.role.getItems(RESET_TIME_MARK).count;
	if (reset_times < FREE_RESET_NUM) {
		ctx.role.addItemsNoSave(RESET_TIME_MARK);
	}else{
		ctx.role.castItemsNoSave(RESET_CAST);
	}
	
	let total = [];
	// level
	let tmp = ctx.mythic.level;
	while(tmp > 1) {
		const cast = global.gameconfig.mythicallevel[tmp - 1];
		if (!cast) break;
		total.append(cast);
		tmp--;
	}
	// class
	tmp = ctx.mythic.class - 1;
	while(tmp > 0) {
		const cast = global.gameconfig.mythicalclass[tmp];
		if (!cast) break;
		total.append(cast.ITEMS);
		tmp--;
	}
	// pskill
	const pskill = global.gameconfig.mythical[ctx.request.body.mythic];
	ctx.assert(pskill, 'invalid mythical');
	for (let i = 0; i < pskill.length; i++) {
		const sid = pskill[i];
		const config = global.gameconfig.mythicalskill[sid];
		ctx.assert(config, 'invalid skill');
		let lv = ctx.mythic.pskill[i] - 1;
		while (lv > 0) {
			total.append(config[lv]);
			lv--;
		}
	}
	// talent
	const { CAST: tcast = [], CALSS_CAST: class_cast = [] } = global.gameconfig.mythicaltalent[ctx.request.body.mythic];
	ctx.assert(tcast.length > 0, 'invalid tcast config');
	ctx.assert(class_cast.length > 0, 'invalid class_cast config');
	// 天赋突破消耗 ,根据玩家身上的天赋来返还
	for (let i = 0; i < tcast.length; i++) {
		// 每个天赋的里面每个技能
		for (let k = 0; k < tcast[i].length; k++) {
			if (!ctx.mythic.talent[i]) continue;
			if (!ctx.mythic.talent[i][k]) continue;
			let num = ctx.mythic.talent[i][k].pro || 0;
			if (num == 0) continue;
			tcast[i][k].forEach(item => {
				// 资源加回给玩家
				total.append({ GSID: item.PMARK, COUNT: num });
				console.log('total',total);
			});
			
		}
	}
	let talentskills = ctx.mythic.talentskill || [];
	// 天赋进阶消耗
	for (let i=0;i<talentskills.length;i++) {
		if (!talentskills[i]) continue;
		// 根据天赋下标,读取升级改天赋的消耗配置
		let skillcasts =  class_cast[i];
		skillcasts.forEach(item =>{
			total.append(item);
		})
	}

	ctx.body = total.arrange();
	ctx.mythic = { level: 1, class: 1, pskill: [1, 0, 0, 0], talent: [], talentskill: [] };
	ctx.role.addItemsNoSave(ctx.body);
}