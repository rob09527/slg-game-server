'use strict'
/**
 * 活动表
 */
module.exports = exports = {
    // 活动类型
    type: {type: String, require: true, unique: true},
    // 活动开始时间
    start: {type: Number, default: Date.now},
    // 活动中文名
    name: {type: String, default: ""},
    mtitle: String, // 补偿邮件标题
    mcontent: String, // 补偿邮件内容
    etime: Number, //活动结束时间
    roleday: Number, // 绝对创建时间
    duration: Number, // 根据创角时间来的持续时间
    offtime: Number,  // 创角偏移天数，有配置 duration时有效
    template: String, // 活动所用前端展示模版
    iconpath: String, // 外部图标
    iconcpath: String, // 展开图标
    expand: String, // 用于前端配置的拓展参数字段
    params: { // 活动参数, reward: {/*直接领取的奖励*/}, sppack: {/*超值礼包数据*/} , lucky: {/* 抽将类奖励 */}
        type: Object,
        default: {}
    }
}
