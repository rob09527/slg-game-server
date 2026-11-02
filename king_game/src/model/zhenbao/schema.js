
'use strict'

module.exports = {
    rid: String,
    // 配置中的ID,角色唯一
    zbId: {type: Number, alias: 'zbid', require: 1},
    // 强化等级
    slv: {type: Number, default: 0},
}