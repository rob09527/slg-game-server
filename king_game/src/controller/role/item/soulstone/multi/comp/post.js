/**
 * 合成
 */
'use strict'

module.exports = async ctx =>{
  let {
    consume,
  } = ctx.request.body;
  ctx.assert(consume.length === 2, 'invalid consumenum');
  let star = 999;
  // 枚举合成比例,[普通,光,暗]
  let mark = [0,0,0];
  let delsoulgsids = [];
  for (let stone of consume) {
    let config = global.gameconfig.soulstone[stone.gsid];
    ctx.assert(config, 'invalid stonegsid');
    // 生成最小星级的石头
    if (star > config.STAR) star = config.STAR;
    mark[config.SOUL_TYPE - 1]++;
    delsoulgsids.push(stone.gsid);
  }
  mark = mark.join('_');
  let comp_config = global.gameconfig.soulstone_comp[star - 1][mark];
  ctx.assert(comp_config, 'invalid compset'+mark);
  // 随机石头魂石类型
  let soul_type = ctx.random.inweight(comp_config.W) + 1;
  let pool = Object.values(global.gameconfig.soulstone).deepQuery('STAR', star).deepQuery('SOUL_TYPE', soul_type);
  ctx.assert(pool.length >= 1, 'invalid pool');
  let rates = pool.deepMap('W_COMP');
  let stone_config = pool[ctx.random.inweight(rates)];
  ctx.assert(stone_config, 'invalid newstone');
  // 删除狗粮石头
  consume = consume.map(stone => stone._id.toString());
  await ctx.dao.soulstone.deleteMany({_id: {$in: consume}});
  ctx.role.addItemsNoSave(stone_config.GSID);
  // 打印被删除的狗粮石头和获得新的石头
  console.log(`soulstone comp uid: ${ctx.role.uid} and servid: ${ctx.role.servid} and consume gsid: ${delsoulgsids.join(',')} and add gsid: ${stone_config.GSID}`);
  await ctx.role.save();
  let newstone = ctx.role.newsoulstone[0];
  ctx.body = {
    soul: newstone.base(),
  }
}