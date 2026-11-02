/**
 * 兵书合成
 */
'use strict'

module.exports = exports = async (ctx, next) =>{
  let {
    gsid,
    consume = [],
  } = ctx.request.body;
  let des_config = global.gameconfig.bookitems[gsid];
  ctx.assert(des_config, 'invalid gsid');
  ctx.assert(Array.isArray(consume) && consume.length === 3, 'invalid booknum');
  let total_exp = 0;
  let logs = [];
  for (let _id of consume) {
    let c_book = await ctx.dao.book.findOne({_id});
    ctx.assert(c_book, 'cbook nexist');
    ctx.assert(c_book.rid === ctx.role.i(), 'invalid cbook');
    ctx.assert(!c_book.general, 'takeoff first');
    let config = global.gameconfig.bookitems[c_book.gsid];
    ctx.assert(config, 'invalid cbookgsid');
    ctx.assert(config.STAR === des_config.STAR, 'invalid consume');
    // 返还强化材料
    if (c_book.level > 1) {
      for (let i = 2; i <= c_book.level; i++) {
        let exp = global.gameconfig.bookstr.EXP[i + '_' + config.POS];
        if (!exp) break;
        total_exp += exp.EXP;
      }
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
  // 删除狗粮
  await ctx.dao.book.deleteMany({_id: {$in: consume}});
  // 打印删除日志
  logs.forEach(log => console.log(log));
  // 给新兵书
  ctx.role.addItemsNoSave(gsid);
  let items = [];
  if (total_exp > 0) items.push({gsid: 30092, count: total_exp});
  ctx.role.addItemsNoSave(items);
  await ctx.role.save();
  let book = ctx.role.newbook[0];
  book = await book.base();
  ctx.body = {
    book,
    items
  }
}