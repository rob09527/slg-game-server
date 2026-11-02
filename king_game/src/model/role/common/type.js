
'use strict';

module.exports = exports = function (gsid) {
	let num = parseInt(gsid) / 10000;


	switch (Math.floor(num)) {
		case 1:
			return 'general';
		case 11:
			return 'tianlao';
		case 9:
			return 'others';
		case 5:
			if (num * 10 >= 51 && num * 10 < 52) { // 头像框
				return '_frames';
			} else if (num * 10 >= 54 && num * 10 < 55) { //兵书
				return 'book';
			} else if (num * 10 >= 56 && num * 10 < 57) {	// 魂石
				return 'soulstone';
				// }else if (num * 10 >= 57 && num * 10 < 58) {	// 57000 ~ 57999 珍宝
				// 	return 'zhenbao';
			} else if (num * 10 >= 58 && num * 10 < 59) {// 58000 ~ 58999 珍宝碎片
				return 'zbpiece';
			} else if (num * 10 >= 59 && num * 10 < 60) {
				return 'props';
			}
		case 6:
			if (gsid >= 60000 && gsid <= 60499) {         //印记
				return 'signet'
			} else if (gsid >= 60500 && gsid < 61000) {   // 称号
				return '_titles';
			} else if (gsid >= 61000 && gsid < 62000) {   // 灵宠
				return 'pet';
			} else if (gsid >= 62000 && gsid < 63000) {   // 新坐骑
				return 'horse';
			}
		default:
			if (num * 10 >= 38 && num * 10 <= 39) {
				return 'hide';
			} else {
				return 'props';
			}
	}
}