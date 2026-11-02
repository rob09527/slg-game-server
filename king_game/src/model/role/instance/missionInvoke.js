
'use strict'

const assert = require('assert');

const { loginRecord } = require("../../../util/event/fourteenlogin");

const GENERAL_STAR_NUM = {
	"4": 90188,
	"5": 90189,
	"6": 90190,
	"7": 90191,
	"8": 90192,
	"9": 90193,
	"10": 90194,
	"11": 90373,
	"12": 90374,
	"13": 90375,
	"14": 90376,
	"15": 90377,
}

const _give = async function (mark, role, num) {
	num = num || 1
	role.addItemsNoSave({ gsid: mark, count: num });
}

const _daily_history_num = async function (mark_daily, mark_history, role, num) {
	num = num || 1;
	role.addItemsNoSave([{ gsid: mark_daily, count: num }, { gsid: mark_history, count: num }]);
}

const _top = async function (mark, role, num) {
	const now = role.getItems(mark).count;
	if (now >= num) return;
	const del = num - now;
	_give(mark, role, del);
}

const MISSION_FN = {
	'DENGLU': async function (role, login) {
		if (role.getItems(90163).count <= 0) {
			let marks = [
				90163,	// 每日首次登陆标记
				90215,	// 每日首次登录(累计)
				90484,	// 每日签到天数
			]

			role.addItemsNoSave(marks);
			loginRecord(role); // 14 日签到累计登录标记增加
		};
		// 元宵豪礼是否签到
		let [start, end] = global.config.ZHD["YX_SIGNIN"];
		if (role.getItems(98355).count <= 0 && Date.in(start, end)) {
			// 元宵豪礼累计登录天数
			role.addItemsNoSave([98355, 98354]);
		}
		//检查是否打完主线标记
		if (role.mapfinished) {
			const next_chapterid = global.gameconfig.maplist[role._maxmapid + 1];
			if (global.gameconfig.chapter[next_chapterid]) {
				role.mapfinished = false;
			}
		}
		if (role.special.mopup) {
			let now = new Date();
			now = now.setHours(0, 0, 0, 0);
			let items = [];
			if (role.special.mopup < now) {
				role.special.mopup = 0;
				role.markModified("special.mopup");

				items.push({ gsid: 90670, count: 0 })
				items.push({ gsid: 90693, count: 0 })
			}
			else {
				items.push({ gsid: 90670, count: 3 })
			}
			items.push({ gsid: 90671, count: 0 })
			role.setItemsNoSave(items);
		}

		if (login) {
			let rankService = new global.services.RankService('power', role._gameserv.groupid);
			await rankService.set({
				id: role.i(),
				score: role._power
			})
			global.dao.rankmission.notify('power', role._power, role.i(), role._gameserv.groupid).catch(console.error);
		}

		await global.dao.warorder.point(role, 90561);  // 卧龙战令-登录游戏
	},
	'GUAJIHISTORY': _give.bind(null, 90598),
	'PVP_TEAM_HISTORY': _give.bind(null, 95019),// 组队演武挑战一次
	'GUAJIDAILY': _give.bind(null, 90164),
	'DIANJIANG': _give.bind(null, 90177),
	'YUANZHENG': _top.bind(null, 90182),
	'POWER_HISTORY': _top.bind(null, 90185),	// 历史最高战力(前10)
	'POWER_HISTORY_SEC': _top.bind(null, 90394),	// 历史2组最高战力(前20)
	'KUAIZAN_DAILY_HISTORY': _daily_history_num.bind(null, 90165, 90166), // 原 点金-改为快战收益次数
	'GUANXIN_NORMAL_DAILY_HISTORY': _daily_history_num.bind(null, 90167, 90168),
	'GUANXIN_PREMIUM_DAILY_HISTORY': _daily_history_num.bind(null, 90217, 90218),
	'HECHENG_DAILY_HISTORY': _daily_history_num.bind(null, 90169, 90170),
	'ZHAOMU_NORMAL_DAILY_HISTORY': _daily_history_num.bind(null, 90171, 90172),
	'ZHAOMU_FRIEND_DAILY_HISTORY': _daily_history_num.bind(null, 90173, 90174),
	'ZHAOMU_PREMIUM_DAILY_HISTORY': _daily_history_num.bind(null, 90175, 90176),
	'DAZHANYI_DAILY_HISTORY': _daily_history_num.bind(null, 90178, 90179),
	'DAZHANYI_MBOSS_HISTORY': _give.bind(null, 95011),
	'JINGJICHANG_DAILY_HISTORY': _daily_history_num.bind(null, 90180, 90181),
	'GENERAL_EXCHANGE_DAILY_HISTORY': _daily_history_num.bind(null, 90219, 90220),
	'GENERAL_DECOMP': _give.bind(null, 90195),
	'GENERAL_NUMSTAR_HISTORY': async function (role, gs) {
		if (!Array.isArray(gs)) gs = [gs];
		let tmp = {};
		let num = 0;
		for (let g of gs) {
			if (g.dontmark) continue;
			let gsid = g.GSID || g.gsid;
			const config = global.gameconfig.general[gsid];
			if (!config) continue;
			num++
			if (config.STAR < 4) continue;
			let mark = GENERAL_STAR_NUM[config.STAR];
			role[`${mark}_GSID`] = gsid; // 不能删除，跑马灯通知的文案参数,具体调用 看 houseLampNotify.js
			if (!mark) continue;
			tmp[mark] = tmp[mark] || 0;
			tmp[mark]++;
		}
		if (num > 0) role.addItemsNoSave({ gsid: 90187, count: num });
		for (let [gsid, count = 0] of Object.entries(tmp)) {
			if (count <= 0) continue;
			role.addItemsNoSave({ gsid, count });
		}
	},
	'GENERAL_LV_HISTORY': async function (role, general_lv, guid) {
		let now = role.getProp(90186);
		if (now < general_lv) role.addItemsNoSave({ GSID: 90186, COUNT: general_lv - now });
		role.generallv20re = role.generallv20re || {};
		if (!role.generallv20re[guid] && general_lv >= 20) {
			role.addItemsNoSave(95002);
			role.generallv20re[guid] = Date.now();
			role.markModified('generallv20re');
		}
	},
	'GENERAL_RESET_HISTORY': _give.bind(null, 95013),
	'GENERAL_HORSE_LVUP': _give.bind(null, 95003),
	'GENERAL_HORSE_RESET': _daily_history_num.bind(null, 90724, 95007),
	'GENERAL_PERSUA': _give.bind(null, 90596),
	'EQUIP_TREASURE_CHK': async function (role, items) {
		if (!Array.isArray(items)) items = [items];
		const { equip, treasure } = global.gameconfig;
		for (const item of items) {
			if (item.unmark) continue;
			const gsid = item.GSID || item.gsid;
			if (!gsid) continue;
			if (equip[gsid]) {
				const quality = equip[gsid].QUALITY;
				if (quality >= 3 && quality <= 6) _give(quality - 3 + 90196, role, item.COUNT || item.count);
			}
			if (treasure[gsid]) {
				const { QUALITY: quality, STAR: star } = treasure[gsid];
				if (!item.onlystar && quality >= 3 && quality <= 6) _give(quality - 3 + 90200, role, item.COUNT || item.count);
				if (star >= 2 && star <= 6) _give(star - 2 + 90204, role, item.COUNT || item.count);
			}
		}
	},
	'OFFICIAL_SALARY_HISTORY': _give.bind(null, 95005),
	'SHOP_BUY_DAILY': _daily_history_num.bind(null, 90718, 95006),
	'PVP_CHALLENGE_WIN': async function (role) {
		if (role.pvpwinchain >= 5 && role.getProp(95009) <= 0) role.addItemsNoSave(95009);
	},
	'LEGION_JOIN': _give.bind(null, 95014),
	'LEGION_SIGN': _daily_history_num.bind(null, 90719, 95015),
	'LEGION_FIGHT': _daily_history_num.bind(null, 90720, 90721),
	'TEAMPVP_JOIN': _give.bind(null, 95018),
	'WANG_GIFT_GET': _give.bind(null, 95020),
	'WANG_SHAME': _give.bind(null, 95021),
	'AFFAIRS_START_SOLO': async function (role) {
		_give(95016, role);
		_give(90599, role);
	},
	'AFFAIRS_FINISH_SOLO': async function (role, star = -1) {
		switch (star) {
			case 4:
				_give(90600, role);
				break;
			case 5:
				_give(90601, role);
				break;
			case 6:
				_give(90602, role);
				break;
			case 7:
				_give(90603, role);
				break;
		}
	},
	'AFFAIRS_START_TEAM': _give.bind(null, 95017),
	'MANOR_BUILDING_LVUP': _give.bind(null, 95022),
	'MANOR_OUTSIDE_CHALLENGE': _give.bind(null, 95023),
	'MYTHIC_ACTIVE': async function (role, level) {
		if (level > 1) return;
		role.addItemsNoSave(95024);
	},
	'MYTHIC_LVUP': _top.bind(null, 95025),
	'TOPKING_LIKE': _give.bind(null, 95026),
	'MAZE_CHALLENGE_WIN': _give.bind(null, 95029),
	'MAIN_CHAPTER_REAP': _give.bind(null, 90589),
	'ZHENBAO_ACTIVE': _give.bind(null, 98400),
	'ZHENBAO_DEPOTLVUP': _give.bind(null, 98403),
	'ZHENBAO_ROLL_NORMAL': _give.bind(null, 98401),
	'ZHENBAO_ROLL_PREMIUM': _give.bind(null, 98402),
	'GENERAL_LV_UP': _daily_history_num.bind(null, 90714, 90715),
	'TOWER_TIMES': _daily_history_num.bind(null, 90716, 90717),
	'FRIEND_FIGHT': _daily_history_num.bind(null, 90722, 90723),
	'DESTINY_REFERSH': _daily_history_num.bind(null, 90725, 90726),
}

module.exports = exports = function (mission, argv0, argv1) {
	const fn = MISSION_FN[mission];
	assert(fn, 'invalid mission');
	fn.call(null, this, argv0, argv1);
	return this;
}
