'use strict'

// 第三方购买商品
module.exports = exports = {
	id: {type: String, require: 1, unique: 1},
    pid: {type: String, require: 1},
    price: {type: Number, require: 1},
    name: {type: String},
}
