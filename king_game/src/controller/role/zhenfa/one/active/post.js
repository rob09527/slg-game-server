
'use strict'

const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");

module.exports = async ctx => {
  let {
    id: zid,
  } = ctx.request.body;
  ctx.assert(!ctx.zhenfa, 'already active');
  zid = +zid;
  const conf = global.gameconfig.zhenfa.deepQueryOne('ID', zid);
  ctx.assert(conf, 'invalid id');
  ctx.role.castItemsNoSave(conf.ACTIVE_CAST);
  await ctx.role.save();
  ctx.zhenfa = await ctx.dao.zhenfa.activeZf(ctx.role._id, zid);
  ctx.body = {};

  //秘境主线任务打点
  await secretTask(ctx, 99564, 1)
}