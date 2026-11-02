
'use strict'

const assert = require('assert');
const moment = require('moment');
// 临时调整时间
const INTERVAL_HOURS = {
	SEASON: 7 * 24,
	YEAR: 28 * 24,
};

let cache;

module.exports = exports = function () {
	if (!cache || cache.expired < Date.now()) {
		let _interval_ms = INTERVAL_HOURS.SEASON * 60 * 60 * 1000;
		let {
			BATTLESEASON: config = {}
		} = global.gameconfig.others;
		let {POS = []} = config;
		let {GAMETIMESTAR: STARTTIME = "2019-11-01 00:00"} = global.config;
		assert(POS.length > 0, 'invalid config');
		let start = moment(STARTTIME).valueOf();
		let del = Date.now() - start;
		let len = POS.length;
		let week = Math.ceil(del / _interval_ms);
		let etime = Math.ceil(del / _interval_ms) * _interval_ms + start;
		let season = (week % 4) + 1;	// 四季,春夏秋冬1234
		let pos = POS[week % len];
		_interval_ms = INTERVAL_HOURS.YEAR * 60 * 60 * 1000;
		let year = Math.trunc(del /_interval_ms);
		cache = {
			expired: Date.now() + 60 * 1000,
			info: {etime, year, season, pos},
		}
	}
	return cache.info;
}