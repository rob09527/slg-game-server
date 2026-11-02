
"use strict"

// 获取弹窗信息
module.exports = exports = async (ctx, next) => {
    try {
        let config = global.gameconfig.tcpz
        if (config[0][0].gsid) {
            ctx.body = { gsid: config[0][0].gsid }
        } else {
            ctx.body = { gsid: -1 }
        }
    } catch (error) {
        console.error(error)
        ctx.body = { gsid: -1 }
    }

}