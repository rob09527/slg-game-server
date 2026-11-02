
'use strict'


const moment = require('moment');
/**
 * @param cron {string} 0 0 0 * * 1 // 格式 秒 分 时 日 月 周
 * @param keeping {number} 持续时间
 * @type {function(*): *}
 * @return  {{CURRENT_START_TIME , NEXT_START_TIME, status: boolean}} // 返回本期 开始时间和 下一期开始时间 ,status 为是否在活动时间内
 */
module.exports = exports = function (cron, keeping = 0) {

	// 解析 配置 得到 秒 分 时 日 月 周
	const [s, m, h, d, M, w] = cron.split(' ');
	const now = moment();
	let cycle = ''; // 指定周期时间
	let cycleUnit = ''; // 周期单位
	if (s !== '*') {
		now.set('s', +s);
	}
	if (m !== '*') {
		now.set('m', +m);
		cycle = 1;
		cycleUnit = 'h';
	}
	if (h !== '*') {
		now.set('h', +h);
		cycle = 1;
		cycleUnit = 'D';
	}
	if (d !== '*') {
		now.set('D', +d);
		cycle = 1;
		cycleUnit = 'M';
	}
	if (M !== '*') {
		now.set('M', +M);
		cycle = 12;
		cycleUnit = 'M';
	}
	if (w !== '*') {
		const week = +w;
		// 设置到指定周
		// 周天为 7
		now.set('d', week);
		cycle = 7;
		cycleUnit = 'd';
	}
	const NEXT_START_TIME = now.valueOf();
	const currentTime = Date.now();
	if (now.valueOf() > currentTime) { // 如果未开始,就减去一个周期
		if (cycle) {
			now.add(-cycle, cycleUnit); // 倒退一个周期看看结束没
		}
	}
	const endTime = now.valueOf() + keeping; // 得到结束时间
	const r = {
		NEXT_START_TIME,
		CURRENT_START_TIME: now.valueOf(),
	};
	let status = 0;
	if (currentTime < endTime && currentTime >= now.valueOf()) { // 未结束
		status = 1;
	} else { // 结束当前周期
		// const cNOW = moment();
		// cNOW.add(Math.floor(cycle/ 2), cycleUnit); // 如果现在的时间超过半个周期，就把下一期的开始时间作为当前期的时间
		const cNow = Date.now() + keeping; // 当前时间加上一个持续时间
		if (cNow > r.NEXT_START_TIME){
			const t = moment(r.NEXT_START_TIME);
			r.CURRENT_START_TIME = r.NEXT_START_TIME;
			t.add(cycle, cycleUnit);
			r.NEXT_START_TIME = t.valueOf();
		}

	}
	r.status = status;
	return r;
}
