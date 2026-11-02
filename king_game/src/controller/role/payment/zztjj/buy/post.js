"use strict"
// 周主题基金(周活动签到)购买
module.exports = async function (ctx, next) {
  let { platform, bundle, channel, version, type = null } = ctx.request.body;
  let TYPE_MATCH = ['gz', 'dj', 'gx'];
  ctx.assert(TYPE_MATCH.includes(type), 'invalid type');
  let key = ctx.role.isXS(`xs_zztjj_${type}`) ? `zztjj_${type}`:`zztjj1_${type}`
  if(type == 'dj' || type == 'gz'){
     key = `zztjj_${type}`;
  }
  let record = ctx.role[key] || {};
  let ispay = record.ispay || 0;
  ctx.assert(ispay == 0, "already buy");
  let config = ctx.config;
  ctx.assert(config, 'invalid config');
  let param = {
    platform,
    bundle,
    channel,
    version,
    pid: key,
    price: config.PRICE,
    uid: ctx.role.uid,
    rid: ctx.role.i(),
    servid: ctx.role.servid,
  }
  const { data } = await ctx.orderReq(param);
  ctx.assert(!data.error, data.error);
  ctx.body = data;
}