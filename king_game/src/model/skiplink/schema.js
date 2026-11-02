'use strict'
/**
 * 跳转链接配置
 */
module.exports = exports = {
    channel: {type: String, require: true, index: true}, // 渠道
    url: {type: String, require: true, default: ''}, // 跳转链接
    bundles: {type: Array, default: []}, // 包名，可选，需要则添加
    isshow: {type: Boolean, default: false}, // 是否显示
    // 更新&创建时间
	updateat: {type: Number, default: Date.now},
}