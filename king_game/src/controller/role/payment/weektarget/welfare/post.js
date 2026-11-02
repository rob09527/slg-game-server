"use strict"

// 福利礼包购买
module.exports = async function(ctx, role) {
    const { WELFARE } = global.gameconfig.weektarget;
    let { index } = ctx.request.body;
    let item = WELFARE[index];
    ctx.assert(item, "item nexist");
    let record = ctx.role.weektarget || {};
    if(!record.wel) record.wel = [];
    ctx.assert(ctx.role.vip >= item.VIP, "vip limit");
    let buynum = item.LIMIT - (record.wel[index] || 0);
    ctx.assert(buynum > 0, "no more");
    ctx.role.castItemsNoSave(item.COST);
    // 根据职业导师，领取不一样奖励
    let tutor = ctx.role.tutor || 1;
    let reward = item.REWARD;
    if(item.ARROCCU) reward = item.ARROCCU[tutor - 1];
    ctx.role.addItemsNoSave([...reward, ...item.SPECLIST]);
    record.wel[index] = item.LIMIT - buynum + 1;
    ctx.role.weektarget = record;
    ctx.role.markModified('weektarget.wel');
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