/**
 * 觉醒宝物洗练接口
 */

'use strict'

module.exports = async (ctx, next) => {
  let {
    costtreas,
  } = ctx.request.body;
  let treasure_obj = ctx.treasure_obj
  // 重新随机无双属性
  let keys = Object.keys(treasure_obj.property);
  let uattrs = global.gameconfig.treasureawake.UATTRS.filter(attr =>{
    return attr.LEVEL <= keys.length;
  })
  // 随机新属性(不重复)
  let new_attrs = [];
  while(new_attrs.length < keys.length) {
    let __attrs = new_attrs.deepMap('ATTR');
    // 过滤已选出的新属性
    uattrs = uattrs.filter((elem) =>!__attrs.includes(elem.ATTR));
    let rates = uattrs.deepMap('W');
    new_attrs.push(uattrs[ctx.random.inweight(rates)]);
  }
  let new_property = {};
  for (let attr of new_attrs) {
    new_property[attr.ATTR.toLowerCase()] = attr.VAL;
  }
  // 消耗红宝
  if (costtreas.length === 24) {
    let {
      deletedCount,
    } = await ctx.dao.awake_treasure.deleteOne({_id: costtreas});
    ctx.assert(deletedCount === 1, 'costtreas nexist');
  }else{
    let config = global.gameconfig.treasure[costtreas];
    ctx.assert(config && config.QUALITY >= 6, 'invalid costtreas');
    ctx.role.castItemsNoSave({gsid: costtreas, count: 1});
    await ctx.role.save();
  }
  // 保存预览
  await treasure_obj.updateOne({$set: {property_preview: new_property}});
  treasure_obj.property_preview = new_property;
  ctx.body = await treasure_obj.base();
}
