'use strict'

module.exports = exports = async (ctx, next) =>{
    let record = await ctx.dao.c_qxzlreward.findOne({_id:ctx.request.body.id ,rid: ctx.role.i()});
    ctx.assert(record,'no record')
    ctx.assert(!record.state,'already took')

    record.state = 1;
    ctx.role.addItemsNoSave(record.reward);
    await ctx.role.save();

    await record.save();

    ctx.body = {
        reward:record.reward
    }
}