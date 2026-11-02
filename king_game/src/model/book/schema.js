/**
 * 兵书
 */
'use strict'

const {
  Schema,
} = require('mongoose');

module.exports = exports = {
	rid: {type: String, require: 1, index: 1},
  // 兵书的gsid,已包含星级
  gsid: {type: Number, require: 1, index: 1},
  // 强化等级
  level: {type: Number, default: 1},
	/**
   * 随机属性,结构样例
   * rand: {
   *  atk: {
   *    str: 1, // 被强化次数
   *  },
   *  ...
   * }
   */
  rand: {type: Schema.Types.Mixed, default: {}},
  /**
   * 无双属性,觉醒后获得,结构样例
   * awake: {
   *  hp: 1,  // val仅占位用,具体值从配置中读取
   *  ...
   * }
   */
  awake: {type: Schema.Types.Mixed, default: {}},
  // 随机属性洗练预览数据,结构与随机属性rand相同
  randresetpreview: {},
  // 无双属性洗练预览数据
  awakeresetpreview: {},
  // 被装备的武将id
  general: {type: String},
	// 创建时间
	create: {type: Number, default: Date.now},
}