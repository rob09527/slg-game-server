/**
 * 魂石
 */
'use strict'

const {
  Schema,
} = require('mongoose');

module.exports = exports = {
	rid: {type: String, require: 1, index: 1},
  // 兵书的gsid,已包含星级
  gsid: {type: Number, require: 1, index: 1},
  // 光暗属性
  attrs: {type: Object},
  // 被装备的武将id
  general: {type: String},
	// 创建时间
	create: {type: Number, default: Date.now},
}