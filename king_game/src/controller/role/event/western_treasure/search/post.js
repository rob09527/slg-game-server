"use strict"

const ID = ["normal", "high"]

// 寻宝
module.exports = async function (ctx, next) {
    const { id } = ctx.request.body
    let type = null;
    let cost = null
    if (ID.includes(id)) {
        let setting = ctx.config.SETTING.find(({ ID }) => ID == id);
        cost = setting.COST
        type = ctx.random.inweight(setting.EVENT.deepMap("WEIGH"));
        type = setting.EVENT[type].ID;
    }
    const [wt, isCreate] = await global.dao.westerntreasure.fetch(ctx.role.i(), type)
    if (isCreate && cost) { // 寻宝消耗
        ctx.role.castItemsNoSave(cost)
        ctx.role.save().catch(console.error)
    }
    ctx.body = wt.toJSON()
    if (ctx.body.buff) {
        ctx.body.buff = ctx.body.buff.map(({id}) => {
            let buffinfo = global.gameconfig.western_treasure.RANDOM_BUFF.deepQueryOne('BUFFID', id);
            if (!buffinfo) return;
            return {
                id,
                val: buffinfo.VAL,
            }
        })
    }
}