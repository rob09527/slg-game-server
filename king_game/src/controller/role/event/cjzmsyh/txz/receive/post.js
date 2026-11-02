module.exports = async function (ctx, next) {
    let { index } = ctx.request.body
    await ctx.role.cjzminsyhinfo(ctx)
    let time = Date.now()
    let key = 'cjzmtxz'

    //全部领取完了
    if (ctx.role.cjzmsyh['txz']['reward'][index]['free'] == 1 && ctx.role.cjzmsyh['txz']['reward'][index]['vip'] == 1) {
        ctx.assert(false, `No claimed content`)
    }
    console.log(time, ctx.role.special[key])
    //免费的领取完了。不是vip
    if ((!ctx.role.special[key] || time > ctx.role.special[key]) && ctx.role.cjzmsyh['txz']['reward'][index]['free'] == 1) {
        ctx.assert(false, `No claimed content`)
    }

    let item = []
    //免费领取
    if (ctx.role.cjzmsyh['txz']['reward'][index]['free'] == 0) {
        item.push(...global.gameconfig.cjzmsyh[2][index - 1].freeitem)
        ctx.role.cjzmsyh['txz']['reward'][index]['free'] = 1
    }
    //vip领取
    if (ctx.role.special[key] && time < ctx.role.special[key] && ctx.role.cjzmsyh['txz']['reward'][index]['vip'] == 0) {
        item.push(...global.gameconfig.cjzmsyh[2][index - 1].item)
        ctx.role.cjzmsyh['txz']['reward'][index]['vip'] = 1
    }
    ctx.role.addItemsNoSave(item);
    await ctx.role.save()
    let insert = {}
    insert[`cjzmsyh.txz`] = ctx.role.cjzmsyh['txz']
    await ctx.dao.role.updateOne({ _id: ctx.role.rid }, { $set: insert })
    ctx.body = item
}