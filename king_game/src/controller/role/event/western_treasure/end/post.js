"use strict"

// 结束寻宝
module.exports = async function(ctx, next) {
    await global.dao.westerntreasure.deleteMany({ rid: ctx.role.i() })
    ctx.body = {}
}