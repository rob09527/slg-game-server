
'use strict'

module.exports = exports = {
	rid: {type: String, require: true},
	type: {type: String, require: true},
	refresh: {type: Number, default: Date.now},
	goods: {},
	lock: Number // 商店锁定被锁定的商店不能购买
}
