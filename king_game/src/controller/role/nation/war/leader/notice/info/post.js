
'use strict'
// 指挥官公告信息
module.exports = exports = async (ctx, next) => {
    ctx.body = {
        anno: ctx.nationwarInfo.anno
    };
}