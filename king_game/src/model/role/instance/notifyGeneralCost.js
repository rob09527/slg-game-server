
'use strict'

module.exports = exports = function ({type, gsid, gclass, glevel}) {
	// this.sendlog(`general_cost_${type}`, {gsid, class: gclass, level: glevel});
	let reason = {main: type, sec: ''};
	const after = this.getItems(gsid).count
	let data = {
		gsid,
		count: 1,
		curcount: after,
		act: 'CST',
		reason: reason.main,
		sub_reason: reason.sec,
	}
	this.sendlog('item_count_modify', data);
}