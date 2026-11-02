"use strict"

module.exports = async function(ctx, role) {
    const { RECHARGE } = global.gameconfig.weektarget;
    let { date } = ctx.request.body;
    let item = RECHARGE.find(value=>value.DATE == date);
    ctx.assert(item, "item nexist");
    ctx.assert(ctx.role.vip >= item.VIP, "vip limit");
    
    ctx.assert(ctx.role.getProp(item.MARK) >= item.NUM, "The top-up amount is insufficient");
    ctx.assert(ctx.role.getProp(item.PMARK) == 0, "no more");
    let reward = item.REWARD;
    ctx.role.addItemsNoSave([...reward, ...item.SPECLIST,{GSID:item.PMARK, COUNT:1}]);
    const newg = [...(ctx.role.newg || [])];
    await ctx.role.save();
    const result = { items: ctx.toLower(reward) };
    if (newg.length > 0) {
        result.newg = newg.map(function (doc) {
            doc._role = ctx.role;
            return doc.base();
        })
    }
    ctx.body = result;
}