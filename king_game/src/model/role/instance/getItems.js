
'use strict'

const assert = require('assert');

const _type = require('./../common/type');

module.exports = exports = function (gsid) {
	const type = _type(gsid);
	if (type === 'general') return {count: -1};

	if (this._change_items_ && this._change_items_[gsid]){
		let o = this[type] && this[type][gsid] ? {...this[type][gsid]}: {count: 0};
		o.count +=  this._change_items_[gsid];
		return o;
	}
	return this[type]&&this[type][gsid]?this[type][gsid]:{count: 0};
}
