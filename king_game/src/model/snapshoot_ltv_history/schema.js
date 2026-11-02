'use strict'
/**
 * (LTV+留存)快照成历史统计表
 */
module.exports = exports = {
    date: {type: String, require: true, index: true},
    bundle: {type: String, require: true, index: true},
    type: {type: Number}, // 0 表示 uid 汇总， 1 表示 role 汇总
    servid: {type: Number, default: 0},
    ratioList: [Object], /*
    {
            actTotal: Number, // 今日活跃数
            ratio: Number, // 百分比
        }
    */
    roleCount: {type: Number, default: 0},
    payCount: {type: Number, default: 0},
    // 更新&创建时间
	updateat: {type: Number, default: Date.now},
}
