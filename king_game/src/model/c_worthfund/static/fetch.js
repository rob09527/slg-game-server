"use strict"
const moment = require("moment");
const eventstart = require("../../../util/event/eventstart");

/**
 * 激活超值基金
 * @param {object} role 角色信息
 * @param {boolean} isLevelUp 是否是等级解锁的（新用户）
 */
module.exports = async function (role, isLevelUp = false) {
	const { REQUIRE_COUNT, REQUIRE_NAME } = global.gameconfig.function_luck[EVENT_ENUM.WORTH_FUND];
	if (role.getProp(REQUIRE_NAME) < REQUIRE_COUNT) return null;
	let worth = await this.findOne({ rid: role.i() });
	if (!worth) {
		const { 
			LIMITHOUR, // 限购小时
			CDD, // 下次激活天数
		} = global.gameconfig.worthfund;
		// 创角第2天0点后开启
		let lstart = moment(role.create).startOf("day").add(1, "days").valueOf();
		// 改回根据等级解锁 上面注释掉防止哪天又被要求改回去
		// let lstart = isLevelUp ? moment().valueOf() : moment(eventstart("WORTHFUND", role.servid)).valueOf();
		worth = new global.dao.c_worthfund({ rid: role.i() });
		let cdTime = CDD * 24 * 3600 * 1000;
		worth.lstart = lstart;
		worth.lend = worth.lstart + LIMITHOUR * 3600 * 1000;
		worth.tnext = moment(worth.lend).startOf("day").valueOf() + cdTime;
		// 限购期加隐藏期内都没进入游戏的老用户
		while(worth.tnext < Date.now()) {
			worth.lstart = worth.tnext;
			worth.lend = worth.lstart + LIMITHOUR * 3600 * 1000;
			worth.tnext = moment(worth.lend).startOf("day").valueOf() + cdTime;
		}
		await worth.save();
	}
	return worth;
}