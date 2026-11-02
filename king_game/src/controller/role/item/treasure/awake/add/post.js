/**
 * 宝物觉醒接口
 * 宝物觉醒后不能堆叠
 */

'use strict'

module.exports = async (ctx, next) => {
  let {
    generalguid,
    treasure,
  } = ctx.request.body;
  // 指定宝物
  if (generalguid) {
    let general = await ctx.dao.general.findOne({_id: generalguid}, {treasure: 1});
    ctx.assert(general, 'general nexist');
    treasure = general.treasure;
  }
  let treasure_obj;
  // 已觉醒宝物再觉醒
  if (treasure.length === 24) {
    treasure_obj = await ctx.dao.awake_treasure.findOne({_id: treasure});
    ctx.assert(treasure_obj, 'treasure nexist');
    ctx.assert(!treasure_obj.awaketime, 'already awake');
    treasure_obj.awaketime = Date.now();
  }else{
    let config = global.gameconfig.treasure[treasure];
    ctx.assert(config, 'invalid treasure');
    ctx.assert(config.STAR >= 6, 'invalid treasure');
    if (!generalguid) ctx.role.castItemsNoSave({gsid: treasure, count: 1});
    treasure_obj = new ctx.dao.awake_treasure({
      rid: ctx.role._id,
      gsid: treasure,
      awaketime: Date.now(),
    })
    if (generalguid) treasure_obj.general = generalguid;
    // 为了触发推荐礼包
    ctx.role["TREASURE_AWAKE"] = 1;
  }
  // 属性不重复,属性数量+1等于觉醒等级
  let keys = Object.keys(treasure_obj.property);
  // 觉醒石根据觉醒等级消耗
  let stone_num = global.gameconfig.treasureawake.CASTITEMS[keys.length].STONE;
  ctx.role.castItemsNoSave({gsid: 30090, count: stone_num});
  // 增加随机无双属性
  let uattrs = global.gameconfig.treasureawake.UATTRS.filter(attr =>{
    return !keys.includes(attr.ATTR.toLowerCase()) && attr.LEVEL <= keys.length + 1;
  })
  let rates = uattrs.map(attr => attr.W);
  let new_attr = uattrs[ctx.random.inweight(rates)];
  treasure_obj.property[new_attr.ATTR.toLowerCase()] = new_attr.VAL;
  treasure_obj.markModified('property');
  await treasure_obj.save();
  await ctx.role.save();
  ctx.body = await treasure_obj.base();
  // 更新武将宝物数据
  if (generalguid) {
    if (treasure.length !== 24) await ctx.dao.general.updateOne({_id: generalguid}, {$set: {treasure: treasure_obj._id}});
    ctx.body.general = await ctx.role.findGenerals(generalguid);
    ctx.body.general = ctx.body.general.base();
  }
}
