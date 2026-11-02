module.exports = async function (ctx, next) {
    let { index } = ctx.request.body
    await ctx.role.cjzminsyhinfo(ctx)
    let itemid = 38025
    ctx.assert(ctx.role.cjzmsyh['lucky']['reward'][index], `Invalid Config`)
    ctx.assert(ctx.role.cjzmsyh['lucky']['reward'][index].mark[0].count >= 1, `Invalid claim${index}`)
    ctx.assert(ctx.role.getItems(itemid).count >= Number(index), `Insufficient required items${ctx.role.getItems(itemid).count}`)
    let list = [...ctx.role.cjzmsyh['lucky']['reward'][index].item, ...ctx.role.cjzmsyh['lucky']['reward'][index].mark]
    ctx.role.addItemsNoSave(list);
    await ctx.role.save()
    ctx.role.cjzmsyh['lucky']['reward'][index].mark[0].count = 0
    // let insert = { cjzmsyh: { lucky: ctx.role.cjzmsyh['lucky']}}
    let insert = {}
    insert[`cjzmsyh.lucky`] = ctx.role.cjzmsyh['lucky']
    await ctx.dao.role.updateOne({ _id: ctx.role.rid }, { $set: insert })
    ctx.body = ctx.role.cjzmsyh['lucky']['reward'][index].item

}