
'use strict'

module.exports = async function (ctx, next) {
  let config = global.gameconfig.zhd.SGZB;
  ctx.body = {
    selectgsid: 0,
    cgsid: config.CAST[0].GSID || config.CAST[0].gsid || 30107,
    free: config.FREECHANCE - ctx.role.sgzb.free,
    got: config.PICK_MAX - ctx.role.sgzb.time,
    items: config.ITEMS.map(({GSID, COUNT}) => {return {GSID, COUNT}}),
    ritems: config.GENERAL_ITEMS.map(({GSID, GGSID, COUNT}) => {return {GGSID, GSID, COUNT}}),
  }
  if (ctx.role.sgzb.pickgsid) ctx.body.selectgsid = ctx.role.sgzb.pickgsid;
}