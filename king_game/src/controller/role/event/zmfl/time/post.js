'use strict'
const moment = require('moment');

// 周末福利开启关闭时间获取
module.exports = exports = async function (ctx, next) {
	const endWeek = ctx.weeks[ctx.weeks.length - 1];
	let endtime = 0;
	if (moment(ctx.now.valueOf()).add(1, 'days').isoWeekday() == endWeek) {
		endtime = ctx.now.add(1, 'days').endOf('day').valueOf();
	} else if (moment(ctx.now.valueOf()).add(2, 'days').isoWeekday() == endWeek) {
		endtime = ctx.now.add(2, 'days').endOf('day').valueOf();
	} else if (moment(ctx.now.valueOf()).add(-1, 'days').isoWeekday() == endWeek) {
		endtime = ctx.now.add(-1, 'days').endOf('day').valueOf();
	} else if (moment(ctx.now.valueOf()).add(-2, 'days').isoWeekday() == endWeek) {
		endtime = ctx.now.add(-2, 'days').endOf('day').valueOf();
	} else {
		endtime = ctx.now.endOf('day').valueOf();
	}
	ctx.body = { endtime };
}