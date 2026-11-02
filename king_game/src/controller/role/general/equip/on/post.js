
'use strict'

const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");

module.exports = exports = async (ctx, next) => {
	let equip = ctx.request.body.equip;
	let config = global.gameconfig.equip[equip];
	// 判断是否是职业装备
	if (!config) {
		config = global.gameconfig.occuequip[equip];
	}
	ctx.assert(config, 'invalid equip');
	let pos = config.POS - 1;
	ctx.role.castItemsNoSave({ gsid: equip, count: 1 });
	if (ctx.general.equip[pos]) {
		ctx.role.addItemsNoSave({ gsid: ctx.general.equip[pos], count: 1, unmark: 1 });
	}
	ctx.general.equip[pos] = parseInt(equip);
	ctx.general.markModified('equip');
	//秘境主线任务打点
	await secretTask(ctx, 99519, 1)
	console.log("触发穿戴装备")
}