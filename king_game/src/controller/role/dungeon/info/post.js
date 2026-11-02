
'use strict'

module.exports = exports = async (ctx, next) =>{
	// 检查出战武将是否已设置
	ctx.assert(!ctx.dginfo, 'already exist');
	let {guids} = ctx.request.body;
	ctx.assert(Array.isArray(guids) && guids.length == 5, 'invalid guids');
	const generalMap = await ctx.role.findGenerals(guids);
	// 获取武将当前属性
	let generals = {};
	for (let guid of guids) {
		let general = await generalMap[guid];
		ctx.assert(general, 'general nexist');
		ctx.assert(!general.expireAt, 'soul generals cant set'); // 限时武将不能参数 一骑单千
		general = general.base();
		// 设置血量万分比
		general.hppercent = 10000;
		generals[guid] = general;
	}
	// 创建信息缓存
	ctx.dginfo = await ctx.dao.c_dginfo.create({
		rid: ctx.role._id,
		generals,
	})
	ctx.body = {
		generals: Object.values(generals),
	};
	// 扫荡关卡
	let {
		pass: dgpchapter = -1
	} = ctx.role.dgtop;
	// 通关第三关后开启
	if (dgpchapter < 0) return;
	// 通关所有关卡后从倒数第一关开始打
	let max_chapter_num = global.gameconfig.dgchapter.length;
	if (dgpchapter >= max_chapter_num) dgpchapter = max_chapter_num - 1;
	// 添加扫荡关卡
	// 通关全部关卡后扫到至最后一关开头
	if (dgpchapter === global.gameconfig.dgchapter.length - 1) dgpchapter--;
	let reward = [];
	for (let i = 0; i <= dgpchapter; i++) {
		let chapter = new ctx.dao.c_dgchapter({
			rid: ctx.role._id,
			index: i,
			finish: Date.now(),
			// 标记扫荡关卡
			farm: true,
		})
		await chapter.fill();
		for (let [event] of chapter.nodes) {
			let {
				type,
				id,
				buffs,
				goods,
			} = event;
			if (type == 5) ({type, id, buffs, goods} = event);
			if (type <= 3) {	// 战斗事件
				ctx.dginfo.addBuff(chapter.index, buffs[0]);
			}else if (type == 4) {	// 宝箱事件
				reward.append(goods);
			}else if (type == 7) {	// 营地事件
				let config = global.gameconfig.dgevent7[chapter.index].deepQueryOne('ID', id);
				if (!config) continue;
				let cur_num = ctx.dginfo.potion[config.POTION] || 0;
				cur_num++;
				ctx.dginfo.potion[config.POTION] = cur_num;
			}
		}
		// 直接把关卡奖励添加到玩家里
		reward.append(chapter.reward);
		chapter.complete = Date.now();
		chapter.markModified('complete');
		await chapter.save();
	}
	reward = reward.arrange();
	ctx.role.addItemsNoSave(reward, {main: 'dungeon', sec: 'chapterreward'});
	ctx.dginfo.markModified('potion');
	await ctx.dginfo.save();
	await ctx.role.save();
	ctx.body.reward = reward;
	ctx.body.potion = ctx.dginfo.getPotion();
}
