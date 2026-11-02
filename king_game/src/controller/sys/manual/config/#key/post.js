'use strict';
// 提供方法返回内存里的配置
module.exports = exports = async function (ctx, next) {
    ctx.body = global.gameconfig[ctx.params.key] || "empty";
};
