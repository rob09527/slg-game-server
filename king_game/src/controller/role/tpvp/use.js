
'use strict'

const moment = require('moment');
const ms = require('ms');

// 每周五8点开放-下周一24点(整个赛季)
const is_maintain_time = () => {
	let weekday = moment().weekday();
	// weekday = weekday == 0 ? 7 : weekday;
	let { teampvp } = global.gameconfig.time.pvp || {};
	let canOpen = [];
	for (let s in teampvp) {
		canOpen.push(...teampvp[s]);
	}
	if (!canOpen.includes(weekday)) return false;
	let startTime, endTime
	// 如果有6天开放,则不走时间判断
	if (canOpen.length >= 6) return true;
	if (weekday >= 1 && weekday < 4) {
		// 小于周五,取上周五时间
		let firday = moment().weekday(-2).startOf('days');
		startTime = firday.valueOf() + ms('8h');
		endTime = firday.add(4, 'days').valueOf();
	} else if (weekday >= 5) {
		// 大于周五
		startTime = moment().weekday(5).startOf('days').valueOf() + ms('8h');
		endTime = moment().weekday(5).startOf('days').add(4, 'days').valueOf();
	} else if (weekday == 0) {
		// 周日 （国外一周的第一天从星期天开始算,取上周五）
		let firday = moment().weekday(-2).startOf('days');
		startTime = firday.valueOf() + ms('8h');
		endTime = firday.add(4, 'days').valueOf();
	}
	return moment().isBetween(startTime, endTime);
}

module.exports = exports = async (ctx, next) => {
	ctx.hook.pre(EVENT_ENUM.PVP_TEAM);
	// ctx.assert(is_maintain_time(), 'no open');
	ctx.TEAM_OPEN = is_maintain_time();
	await next();
}
