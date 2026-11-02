
/**
 * 觉醒宝物表
 */

'use strict'

const {
  Schema,
} = require('mongoose');

module.exports = exports = {
  rid: {type: String, require: 1, index: 1},
  gsid: {type: Number, require: 1, index: 1},
  // 当前星级觉醒时间
  awaketime: {type: Number},
  // 无双属性
  property: {type: Schema.Types.Mixed, default: {}},
  // 无双属性预览
  property_preview: {},
  // 现穿戴武将
  general: {type: String},
}