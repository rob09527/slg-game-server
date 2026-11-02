
'use strict'

module.exports = async function (ctx, next) {
  let {
    gsid,
  } = ctx.request.body;
  let config = global.gameconfig.zhd.SGZB.GENERAL_ITEMS;
  let general_item = config.deepQueryOne('GSID', Number.parseInt(gsid));
  ctx.assert(general_item, 'invalid gsid');
  ctx.role.sgzb.pickgsid = gsid;
  ctx.role.markModified('sgzb');
  await ctx.role.save();
  ctx.body = {};
}