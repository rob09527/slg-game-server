'use strict'
/**
 * 运营日报快照
 */
module.exports = exports = {
    servid: { // 区服
        type: Number,
        require: 1,
        index: 1
    },
    bundle: {
        type: String,
        index: 1
    }, // 包名
    registerCount: { // 注册数, key 为渠道 + 设备号， value为数值，下同
        type: Number,
        default: 0
    },
    rollRegister: {     // 滚服注册数
        type: Number,
        default: 0
    },
    activeCount: { // 活跃数
        type: Number,
        default: 0
    },
    payCount: { // 付费角色数
        type: Number,
        default: 0
    },
    payTotal: { // 付费总金额数
        type: Number,
        default: 0
    },
    rollPayCount: { // 滚服用户订单数
        type: Number,
        default: 0
    },
    rollPayTotal : { // 滚服用户订单总金额
        type: Number,
        default: 0
    },
    registerPayCount: { // 注册付费数
        type: Number,
        default: 0
    },
    registerPayTotal: { // 注册付费总额
        type: Number,
        default: 0
    },
    create_at : {
        type: String
    }
}
