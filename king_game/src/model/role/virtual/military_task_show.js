
'use strict';

/*
*
* */
module.exports = exports = function () {

	if (!global.gameconfig.military_task) return false; // 未开发该功能

	if(global.gameconfig.military_position.MILITARY[this.military_level + 1]) return false; // 未升级到满级
	let rec = this.getItems(94951).count;
	let is_all_rec = true;
	for (const id in global.gameconfig.military_task) {
		if (! ((rec>> (id - 1)) & 0x00000001) ) {
			is_all_rec = false;
			break;
		}
	}
	return !is_all_rec; // 判断是不是每个项都领取了,都领取了返回 false
}
