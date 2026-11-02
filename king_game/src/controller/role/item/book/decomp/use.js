/**
 * 兵书分解
 */
 'use strict'

module.exports = exports = async (ctx, next) =>{
  let {
    resolve = [],
  } = ctx.request.body;
  if (!Array.isArray(resolve)) resolve = [resolve];
  let logs = [];
  let items = [];
  let total_exp = 0;
  for (let _id of resolve) {
    let c_book = await ctx.dao.book.findOne({_id});
    ctx.assert(c_book, 'cbook nexist');
    ctx.assert(c_book.rid === ctx.role.i(), 'invalid cbook');
    ctx.assert(!c_book.general, 'takeoff first');
    let config = global.gameconfig.bookitems[c_book.gsid];
    ctx.assert(config, 'invalid cbookgsid');
    total_exp += config.EXP;
    // 返还强化材料
    if (c_book.level > 1) {
      for (let i = 2; i <= c_book.level; i++) {
        let exp = global.gameconfig.bookstr.EXP[i + '_' + config.POS].EXP;
        if (!exp) break;
        total_exp += exp;
      }
    }
    // 返还50%觉醒材料
    if (Object.keys(c_book.awake).length > 0) {
      let cast = global.gameconfig.bookawake.CAST[config.POS - 1].map(({GSID, COUNT}) =>{
        return {
          GSID,
          COUNT: Math.floor(COUNT * 0.5),
        }
      });
      items.push(...cast);
    }
    // 组织删除日志,待删除后打印
    let _rand_log = Object.entries(c_book.rand).map(([key, {val, str = 0}]) =>{
      return [key, val, str].join('/');
    }).join(';');
    let _log = [
      'BOOKDEL',
      'COMP',
      Date.now(),
      c_book.gsid,
      c_book.level,
      new Date(c_book.create).getTime(),
      _rand_log,
    ]
    if (c_book.awake) {
      let _awake_log = Object.entries(c_book.rand).map(({key, val}) =>{
        return [key, val].join('/');
      }).join(';');
      _log.push(_awake_log);
    }
    logs.push(_log.join(' '));
  }
  ctx.logs = logs;
  items = items.arrange();
  //  经验材料
  items.push({
    gsid: 30092,
    count: total_exp,
  })
  ctx.body = {
    items,
  }
  await next();
}