
'use strict'

module.exports = async (ctx, next) => {
  await next();
  let property = Object.entries(ctx.treasure_obj.property_preview).map(([key, val]) =>{
    return {
      key,
      val,
    }
  })
  ctx.body = {
    property,
  }
}