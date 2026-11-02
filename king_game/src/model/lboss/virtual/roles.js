
'use strict';

module.exports = exports = function () {
	const _roles = this._roles || {};
	let tmp = [];
	for (let rid in _roles) {
		let {first, last, damges, lastdamge} = _roles[rid];
		tmp.push({rid, first, last, damges, lastdamge});
	}
	tmp.sort((pre, nxt) =>{
		if (pre.damges > nxt.damges) return -1;
		return 1;
	})
	return tmp;
}