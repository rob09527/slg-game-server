'use strict'
/**
 * 推荐礼包
 * @type {{isBuy: {index: boolean, type: NumberConstructor}, price: {type: NumberConstructor}, create: {default: number, type: NumberConstructor}, rid: {index: boolean, require: boolean, type: StringConstructor}, type: {index: boolean, type: StringConstructor}, expireAt: {default: number, index: boolean, type: NumberConstructor}, rewards: []}}
 */
module.exports = exports = {
    rid: {type: String, require: true, index: true},
    type: {type: String, index: true},
    vip: {type: Number}, // 触发时 vip 等级
    create: {type: Number, default: Date.now()},
    expireAt: {type: Number, default: 0, index: true},
    isBuy: {type: Number, default: 0, index: true}, // 是否被购买， 0 未被购买, 1已被购买
    buyTime: {type: Number},
    oid: {type: String}, // 订单号
    price: {type: Number},
    exp: { type: Number },
    rewards: [],
}
