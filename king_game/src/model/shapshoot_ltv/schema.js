'use strict'
/**
 * LTV + 留存数据分析统计表
 */
module.exports = exports = {
    analyze: [Object], /*
        {
                addPayCount: Number, // 新增付费人数
                addPayTotal: Number, // 新增付费总金额
                todayActive: Number, // 今日活跃数
            }
        */
    servid: Number, // 服务id
    bundle: String,
    ids: [String],
    roleCount: Number,
    update_at: Date,
    date: String,
    type: Number, // 0 表示 uid 汇总， 1 表示 role 汇总
}
