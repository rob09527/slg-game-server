
/**
 * 活动期间清理配置jnxl.json.LIST中REFRESH=daily下标对应的role.jnxl记录的字段
 */

'use strict'

module.exports = async function (ctx, next) {
  ctx.body = {};
  ctx.assert(global.config.ZHD.JNXL, 'no timeconfig');
  let [
    start,
    end,
  ] = global.config.ZHD.JNXL;
  ctx.assert(Date.in(start, end), 'not open');
  let indexlist = [];
  for (let [index, item] of Object.entries(global.gameconfig.jnxl.LIST)) {
    if (item.REFRESH !== 'daily') continue;
    indexlist.push(Number.parseInt(index));
  }
  for (let index of indexlist) {
    let key = `jnxl.${index}`;
    let cond = {
      [key]: {
        $gt: 0,
      },
    }
    let update = {
      $unset: {
        [key]: 1,
      },
    }
    await ctx.dao.role.updateMany(cond, update);
    console.log('JNXLDAILY REF', index, new Date().toLocaleString());
  }
}