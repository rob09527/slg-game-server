
'use strict'

module.exports = exports = async (ctx, next) => {
	const equip = global.gameconfig.equip;
	for (const gsid of ctx.general.equip) {	//	脱装备
		if (!gsid) continue;
		ctx.role.addItemsNoSave({ gsid: gsid, count: 1, unmark: 1 });
	}
	let treas = ctx.general.treasure;
	if (treas) {
		if (treas.length !== 24) {
			ctx.role.addItemsNoSave({ gsid: treas, count: 1, unmark: 1 });
		} else {
			// 觉醒宝物更新被穿戴武将标记
			await ctx.dao.awake_treasure.updateOne({ _id: treas }, { $unset: { general: 1 } });
		}
	}

	ctx.general.treasure = undefined;
	ctx.general.equip = [];
	// 套装技能设空
	ctx.general.occusuitskill = [];
}