
'use strict'

const cal_lv = function (exp) {
	let level = 1;
	while(true) {
		let next = global.gameconfig.roleexp[level];
		if (!next || exp < next) break;
		exp -= next;
		level++;
	}
	return level;
}

module.exports = exports = function (items) {
	if (!Array.isArray(items)) items = [items];
	// 检查是否获得角色经验
	let exp_add = 0;
	for (let item of items) {
		let gsid = Number.parseInt(item.GSID ||item.gsid);
		if (gsid !== 38001) continue;
		let count = Number.parseInt(item.COUNT || item.count);
		if (count < 0) continue;
		exp_add += count;
	}
	if (exp_add <= 0) return;
	// 检查登记是否有变化
	let now = this.level;
	let pre = cal_lv(this.getItems(38001).count - exp_add);
	if (now <= pre) return;
}
