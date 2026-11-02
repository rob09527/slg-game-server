'use strict'

// IOS审核版本号
module.exports = exports = {
	gameid: {type: String, index: 1},
    version: {type: String, index: -1}, // 版本号
    status: {type: Number, default: 0, index: -1}, // 0 未启用， 1 启用
}
