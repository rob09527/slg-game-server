module.exports = async function (ctx, next) {
    await ctx.role.cjzminsyhinfo(ctx)
    ctx.body = ctx.role.cjzmsyh
}