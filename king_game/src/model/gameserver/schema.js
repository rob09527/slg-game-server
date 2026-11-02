/**
 * 服务器表
 * 每条数据即一个游戏服
 * 修改数据需要通知所有worker刷新client的gameserv信息
 */
'use strict'

module.exports = {
  // 服务器ID
  servid: { type: Number, require: 1, unique: 1 },
  /**
   * 组ID,相同的组ID代表服务器合服
   */
  groupid: { type: Number, require: 1 },

  // 跨服聊天分组
  room: { type: Number },
  // 服务编号
  sno: { type: Number },
  area: { type: Object }, // area 信息
  // 服务器名字
  name: { type: String, default: 'kingserv' },
  // 开服时间戳
  start: { type: Number, default: Date.now },
  // 创建时间
  create: { type: Number, default: Date.now },
}
