"use strict"

module.exports = async function (ctx, next) {
    ctx.body = {
        total: ctx.config.FIRSTNUM,
        status: ctx.role.getProp(ctx.config.MARK),
        items: ctx.config.ITEMS.map(({ NUM: num, REWARD: reward }) => ({ num, reward })),
    }
}