/**
 * 兵书强化
 */
'use strict'
const {hitHere} = require("../../../../../../util/weektarget");

module.exports = exports = async (ctx, next) =>{
	let {
    bookguid, // 兵书的GUID,
    expitem = 0,  // 是否使用经验道具30092
    consume = [], // 狗粮兵书的GUID列表
  } = ctx.request.body;
  ctx.body.items = [];
  if (!Array.isArray(consume)) consume = [consume];
  let logs = [];
  // 从上下文中获取数据对象
  let book = ctx.book;
  let config = ctx.config;
  // 强化最高等级限制
  ctx.assert(book.level < config.TOPLV, 'nomore strengthen')
  let total_exp = 0;
  for (let c_guid of consume) {
    let c_book = await ctx.dao.book.findOne({_id: c_guid});
    ctx.assert(c_book, 'cbook nexist');
    ctx.assert(c_book.rid === ctx.role.i(), 'invalid cbook');
    ctx.assert(!c_book.general, 'takeoff first');
    let config = global.gameconfig.bookitems[c_book.gsid];
    ctx.assert(config, 'invalid cbookgsid');
    total_exp += config.EXP;
    // 计算强化经验
    if (c_book.level > 1) {
      for (let i = 2; i <= c_book.level; i++) {
        let exp = global.gameconfig.bookstr.EXP[i + '_' + config.POS];
        if (!exp) break;
        total_exp += exp.EXP;
      }
    }
    // 返还50%狗粮兵书觉醒材料
    if (c_book.awake && Object.keys(c_book.awake).length > 0) {
      let castitems = global.gameconfig.bookawake.CAST[config.POS - 1].map(({GSID, COUNT}) =>{
        return {
          GSID,
          COUNT: Math.floor(COUNT * 0.5),
        }
      });
      ctx.body.items.push(...castitems);
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
  let next_exp_count = global.gameconfig.bookstr.EXP[(book.level+1) + '_' + config.POS];
  ctx.assert(next_exp_count, 'nomore level');
  // 从配置中读取是否该等级有属性强化机会
  let is_attr_str = next_exp_count.STR;
  next_exp_count = next_exp_count.EXP;
  if (total_exp < next_exp_count) {
    // 狗粮经验不够,又没用经验道具,抛错
    ctx.assert(expitem, 'nenough exp0')
    expitem = ctx.role.getProp(30092);
    // 狗粮经验+所有经验道具还是不够,抛错
    ctx.assert(total_exp + expitem >= next_exp_count, 'nenough exp1');
    let exp_item_cast_count = next_exp_count - total_exp;
    ctx.role.castItemsNoSave({gsid: 30092, count: exp_item_cast_count});
    ctx.body.castitems = [
      {gsid: 30092, count: exp_item_cast_count},
    ]
  }else{
    // 溢出经验返还经验道具
    expitem = total_exp - next_exp_count;
    if (expitem) {
      ctx.body.items = [
        {gsid: 30092, count: expitem},
      ]
      ctx.role.addItemsNoSave({gsid: 30092, count: expitem});
    }
  }
  book.level++;
  
  // 随机强化一个随机属性
  if (is_attr_str) {
    let key = Object.keys(book.rand);
    key.shuffle();
    key = key[0];
    // 不知道会不会没有随机随性
    if (key) {
      book.rand[key].str = book.rand[key].str || 0;
      book.rand[key].str++;
      book.markModified('rand');
    }
  }
  // 删除狗粮
  await ctx.dao.book.deleteMany({_id: {$in: consume}});
  // 打印删除日志
  logs.forEach(log => console.log(log));
  /**
   * 消耗经验道具
   * 由于上面判断了狗粮经验不够&&玩家选择经验道具才会消耗经验道具
   * 当玩家没有经验道具(count = 0)或者没有选择的时候,!!expitem == false
   */

  //兵书强化提升X级
  hitHere(ctx.role, 98785, 1, true);
  await ctx.role.save();
  await book.save();
}