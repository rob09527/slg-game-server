'use strict'


module.exports = exports = async function (ctx, next) {
    ctx.body = {
        newURL: global.setting.new_url       // 客户端新登录地址(如果需要跳转)
    }
    return ctx.body;
}
