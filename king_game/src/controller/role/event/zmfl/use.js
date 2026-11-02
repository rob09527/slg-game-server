
'use strict'

const moment = require('moment');

// 周末福利
module.exports = exports = async function (ctx, next) {
	const config = global.gameconfig.zmfl;
	ctx.assert(config, 'config nexists');
	ctx.config = config.ITEMS;
	ctx.weeks = ctx.config.map(({ WEEK }) => WEEK);
	// TESTWEEK 方便测试
	ctx.now = config.TESTWEEK ? moment(config.TESTWEEK) : moment();
	ctx.assert(ctx.weeks.includes(ctx.now.isoWeekday()), 'not open');
	ctx.istime = function (week) {
		return ctx.zhdpoint('ZMFLTIME', ctx.now, week);
	}
	await next();
}