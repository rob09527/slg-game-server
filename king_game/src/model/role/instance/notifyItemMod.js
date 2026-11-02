
'use strict'

module.exports = exports = function (gsid, count, add_or_reduce, reason = 'unknow') {	
	if (typeof reason === 'string') reason = {main: reason, sec: ''};
	const after = this.getItems(gsid).count
	let data = {
		gsid,
		count: count,
		curcount: after,
		act: add_or_reduce == 0 ? 'ADD' : 'CST',
		reason: reason.main,
		sub_reason: reason.sec,
	}
	this.sendlog('item_count_modify', data);
}