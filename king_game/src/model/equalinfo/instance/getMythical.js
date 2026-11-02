
/*
	生成战斗神兽数据
 */

'use strict'

const {
	PVPEQUAL: {
		MYTHICAL,
	},
} = global.gameconfig.others;

module.exports = function (tutor) {
	tutor = tutor || this.tutor;	// 可指定导师,如不传则使用自己的导师
	// 默认
	let mythical = {
		tid: 101,
		class: 1,
		level: 1,
		pskill: [],
	}
	let tid = MYTHICAL[tutor];
	if (tid) mythical.tid = tid;
	return mythical;
}
