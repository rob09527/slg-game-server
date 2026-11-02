
/*
	根据战斗数据组织录像正文数据
 */

'use strict'

module.exports = function () {
	let {
		seed,
		season,
		lcards,
		rcards,
		result: {
			version,
			ret: result,
			lper, rper,
			ltper, rtper,
			report,
		}
	} = this;
	let video = {
		lper, rper,
		ltper, rtper,
		report,
		seed,
		season,
		result,
		lcards,
		rcards,
		left: {
			'set': this.player,
			info: {},	// 另外自行设置
		},
		right: {
			'set': this.enemy,
			info: {}, // 另外自行设置
		}
	}
	return video;
}