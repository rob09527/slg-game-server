/**
 * 服务器表
 * 每条数据即一个游戏服
 * 修改数据需要通知所有worker刷新client的gameserv信息
 */
'use strict'

module.exports = {
  // 服务器ID
  servid: {type: Number, require: 1, unique: 1},
  /**
   * 组ID,相同的组ID代表服务器合服
   */
  groupid: {type: Number, require: 1},
  // 服务器名字
  name: {type: String, default: 'dev'},
  room: {type: Number, default: 0}, // 跨服聊天id
  sno: {type: Number}, // 区服编号,区别与服务器ID，ID 是四位以上的数字，编号只是同大区下的服务器序号
  /**
   * info.filter = ['all', 'demo_1004'] // 服务器过滤标识
   */
  info: {type: Object}, // 其他策划自定义的字段
  // 开服时间戳
  start: {type: Number, default: Date.now},
  // 创建时间
  create: {type: Number, default: Date.now},
  // 类型0=正常，1=审核
  type: {type: Number, index: 1, default: 0},
  
  area: { // 大区信息
    name: String,
    id: Number,
  },
  // 非1 为停服状态
  status: {type: Number, default: 1},
  // 自动开服人数
  auto_num: {type: Number},
  // 自动开服付费人数
  auto_pay: {type: Number},
  // 人满创角:1=能,2=不能
  auto_create: {type: Number},
}
