"use strict"

module.exports = async function (ctx, next) {
   let { index } = ctx.request.body
   const item = ctx.config[index]
   ctx.assert(item, "invalid index")
   ctx.assert(ctx.role.getProp(90221) >= item.MONEY, "money not enough")
   ctx.assert(!ctx.record[index], "already took")
   ctx.record[index] = 1
   ctx.role.markModified("daycharge")
   ctx.role.addItemsNoSave(item.REWARD)
   await ctx.role.save()
   ctx.body = {
       reward: item.REWARD,
   }
}