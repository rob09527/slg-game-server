
'use strict'

module.exports = async function (ctx, next) {
  ctx.assert(ctx.zhdpoint("ISZHD", "sgzb"), "not open");
  let _default = {
    free: 0,
    time: 0,
  }
  ctx.role.sgzb = ctx.role.sgzb || _default;
  await next();
}