/**
 * 阵法数据表
 */
'use strict'

module.exports = {
  rid: {type: String, require: 1},
  // 阵法ID
  zid: {type: Number, require: 1},
  // 阶级
  level: {type: Number, default: 0},
  // 阵基数据, 创建是默认有N个阵基
  base: [
    // { // 阵基1
    //   // 突破等级
    //   blv: {type: Number, default: 0},
    //   // 等级
    //   lv: {type: Number, default: 0},
    // },
  ]
}