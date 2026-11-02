/**
 * 珍宝库
 */

'use strict'

const { Schema } = require("mongoose")

module.exports = {
    rid: {type: String, unique: 1},
    // 珍宝库等级
    lv: {type: Number, default: 0},
    // 珍宝库经验
    exp: {type: Number, default: 0},
}