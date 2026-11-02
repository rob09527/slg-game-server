
'use strict'


/* 判断常规活动对应的新手周是否在对应的活动里面是*/
module.exports = exports = function (key) {
	let xsk = 'xs_'+key;
	let zhd_week_xs = global.gameconfig.zhd_week_xs;
	let isCanAc = true;
	for (const week in zhd_week_xs) {
		if (Object.hasOwnProperty.call(zhd_week_xs,week)) {
			if(week < 1) continue;
			if(zhd_week_xs[week].includes(xsk.toUpperCase())){
				isCanAc = false;
				break;
			};
		};
	};
	return isCanAc;
}
