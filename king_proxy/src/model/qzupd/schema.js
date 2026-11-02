'use strict'

// 客户端强更表
module.exports = exports = {
    url: { type: String, require: true }, //  hotURL
    whitelist: Object,
    version: { type: String, index: -1 }, // 版本号
    gameid: { type: String }, // 平台 android ios
    force_cb: Number, // 强制回退
    status: { type: Number, default: 0, index: -1 }, // 0 未发布， 1 发布测试，2 发布正式
    // 当 status  === -1 , 作为存放全局ip白名单的一个项
    create: {
        type: Number,
        default: Date.now
    }
}
