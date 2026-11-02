
'use strict'
const _ = require('lodash');
const secretTask = require('../../../../../model/secretRealmRole/instance/secretTask');
module.exports = exports = async (ctx, next) => {
	const equip = global.gameconfig.equip;
	const occuequip = global.gameconfig.occuequip;
	const generals = global.gameconfig.general;
	let occuequipConfig = _.cloneDeep(occuequip); // 深拷贝
	for (const gsid of ctx.general.equip) {	//	脱装备
		if (!gsid) continue;
		ctx.role.addItemsNoSave({ gsid: gsid, count: 1, unmark: 1 });
	}
	let cast = [];
	for (let i = 1; i < 5; i++) {
		// 优选本职业T级装备
		// 再选非本职业T级装备
		let arr = [];
		let gsid_arr = Object.keys(occuequipConfig).filter(function (gsid) {
			return occuequipConfig[gsid].POS == i;
		}).reverse();

		// 抽出本职业的装备
		let my_occu_gsids = gsid_arr.filter(g => occuequipConfig[g].OCCU == generals[ctx.general.gsid].OCCU);

		// 如果有双职业武将取出他的副职业
		let secod_occu_gsids = gsid_arr.filter(g => occuequipConfig[g].OCCU == generals[ctx.general.gsid].OCCU2);

		// 其他职业装备
		let other_occu_gsids = gsid_arr.filter(g => occuequipConfig[g].OCCU != generals[ctx.general.gsid].OCCU && occuequipConfig[g].OCCU != generals[ctx.general.gsid].OCCU2)
		if (my_occu_gsids.length > 0) arr.append(my_occu_gsids);
		if (secod_occu_gsids.length > 0) arr.append(secod_occu_gsids);
		arr.append(other_occu_gsids);
		// 最后再选普通装备
		let equip_gsid_arr = Object.keys(equip).filter(function (gsid) {
			return equip[gsid].POS == i;
		}).reverse();
		arr.append(equip_gsid_arr);
		for (const gsid of arr) {
			const count = ctx.role.getProp(gsid);
			if (count < 1) continue;
			ctx.general.equip[i - 1] = gsid;
			cast.push(gsid);
			break;
		}
	}
	ctx.general.markModified('equip');
	//秘境主线任务打点
	await secretTask(ctx, 99519, 1)
	console.log("触发穿戴装备")

	const treasure = global.gameconfig.treasure;
	const treas_gsid_arr = Object.keys(treasure).sort(function (pre, nxt) {	// sort quality > star > gsid index
		const t_pre = treasure[pre];
		const t_nxt = treasure[nxt];
		if (t_pre.QUALITY == t_nxt.QUALITY) {
			if (t_pre.STAR == t_nxt.STAR) {
				return parseInt(pre) > parseInt(nxt) ? -1 : 1;
			}
			return t_pre.STAR > t_nxt.STAR ? -1 : 1;
		}
		return t_pre.QUALITY > t_nxt.QUALITY ? -1 : 1;
	});
	const luckConfig = global.gameconfig.function_luck[EVENT_ENUM.GENER_TERA];
	if (ctx.role.getProp(luckConfig.REQUIRE_NAME) >= luckConfig.REQUIRE_COUNT) { // 宝物需要解锁才能触发
		let treas = ctx.general.treasure;
		// 脱宝物需要判断当前是否是觉醒宝物
		if (treas) {
			if (treas.length !== 24) {
				ctx.role.addItemsNoSave({ gsid: treas, count: 1, unmark: 1 });
			} else {
				// 觉醒宝物更新被穿戴武将标记
				await ctx.dao.awake_treasure.updateOne({ _id: treas }, { $unset: { general: 1 } });
			}
		}

		// 需要判断当前宝物gsid,是否有多个。多个优先觉醒等级最高的。
		let awakes_treasure = await ctx.dao.awake_treasure.find({ rid: ctx.role._id, general: { $exists: 0 } });

		// 优先传觉醒宝物
		let awake_treasure;
		if (awakes_treasure.length <= 0) {
			// 没有觉醒宝物使用旧逻辑
			for (const gsid of treas_gsid_arr) {
				const count = ctx.role.getProp(gsid);
				if (count < 1) continue;
				ctx.general.treasure = gsid;
				cast.push(gsid);
				break;
			}
		} else {
			if (awakes_treasure.length > 1) {
				awakes_treasure.sort((a, b) => {
					return Object.keys(b.property).length - Object.keys(a.property).length
				});
			}
			// 取第一个
			awake_treasure = awakes_treasure[0];
			ctx.general.treasure = awake_treasure._id.toString();
			ctx.general._awaketreasure = await awake_treasure.base();
			await awake_treasure.updateOne({ $set: { general: ctx.general._id } });
		}

	}

	// 消耗
	cast = cast.map(function (gsid) {
		return { gsid: parseInt(gsid), count: 1 };
	})
	ctx.role.castItemsNoSave(cast);
}
