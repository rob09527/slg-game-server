/**
 * 洗练预览生成
 */
'use strict'

module.exports = exports = async (ctx, next) =>{
  let book = ctx.book;
  let config = ctx.config;
  ctx.assert(config.STAR >= 6, 'cant reset');
  let {
    lockrattrs = [],
    lockaattr,
  } = ctx.request.body;
  let locknum = lockrattrs.length;
  if (lockaattr) locknum++;
  // 预览消耗
  let castitems = global.gameconfig.book.RESETCAST[locknum];
  ctx.assert(castitems, 'invalid castconfig');
  ctx.role.castItemsNoSave(castitems);
  // 随机属性池
  let config_rand_attr = global.gameconfig.book.RANDATTR[config.STAR - 1][config.POS - 1].ATTRS;
  let rates = config_rand_attr.deepMap('W');
  // 拷贝数据作修改用
  let randresetpreview = {};
  // 先放入被锁定定属性,避免后续随机参与
  for (let key of lockrattrs) {
    randresetpreview[key] = book.rand[key];
  }
  for (let [key, info] of Object.entries(book.rand)) {
    // 锁定的属性已放到预览里,跳过
    if (lockrattrs.includes(key)) continue;
    // 需要洗的属性,随机一条新的,不能跟已有的重复
    while(true) {
      let one = config_rand_attr[ctx.random.inweight(rates)];
      if (randresetpreview[one.KEY]) continue;
      let new_info = {
        str: 0,
      }
      // 如果原来有强化次数,则直接继承
      if (info.str) new_info.str = info.str;
      randresetpreview[one.KEY] = new_info;
      break;
    }
  }
  let awakeresetpreview = JSON.parse(JSON.stringify(book.awake));
  // 无双属性洗练
  if (!lockaattr) {
    let key0 = (Object.keys({})[0] || "").toUpperCase();
    let config_attr_awake = global.gameconfig.bookawake.ATTR[config.POS - 1].filter(value=>{
      return value.ATTR != key0;
    });
    let rates = config_attr_awake.deepMap('W');
    // todo 是否能洗练出同样的属性
    let {
      ATTR,
    } = config_attr_awake[ctx.random.inweight(rates)];
    awakeresetpreview = {
      [ATTR.toLowerCase()]: 1,
    }
  }
  await ctx.role.save();
  // 直接更新预览
  let $set = {
    randresetpreview,
    awakeresetpreview,
  }
  await book.updateOne({$set});
  book.randresetpreview = randresetpreview;
  book.awakeresetpreview = awakeresetpreview;
  ctx.body.castitems = castitems;
}