'use strict'
// 游戏公告
module.exports = exports = {
    title: String, // 公告标题
    type: { // 公告板块
        type: String,
        index: 1,
        default: 'default' // 默认板块， agreement 为隐私协议
    },
    create: {
        type: Number,
        default: Date.now
    },
    content: String, // 公告 H5内容
    bundle: {
        type: [String],
        index: 1
    }, // 包名
    servid: {
        type: [Number],
        index: 1
    },
    status: {
        type: Number,
        default: 0, // 2 展示
        index: 1
    }
}
