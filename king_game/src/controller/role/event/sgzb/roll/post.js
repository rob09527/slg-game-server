
'use strict'

module.exports = async function (ctx, next) {
  let {
    time = 1,
  } = ctx.request.body;
  time = Number.parseInt(time);
  let config = global.gameconfig.zhd.SGZB;
  // 使用免费次数
  if (time === 1 && ctx.role.sgzb.free < config.FREECHANCE) {
    ctx.role.sgzb.free++;
    time--;
  }
  let cost = [];
  if (time > 0) {
    cost = config.CAST.map(({GSID, COUNT}) => {
      return {
        GSID,
        COUNT: COUNT * time,
      }
    })
  }
  if (cost.length > 0) ctx.role.castItemsNoSave(cost);
  let output = [];
  for (let i = 0; i < Number.parseInt(ctx.request.body.time); i++) {
    ctx.role.sgzb.time++;
    let items = [...config.ITEMS];
    let general_item = config.GENERAL_ITEMS.deepQueryOne('GSID', Number.parseInt(ctx.role.sgzb.pickgsid));
    ctx.assert(general_item, 'invalid pickgsid');
    if (ctx.role.sgzb.time >= config.PICK_MAX) {  // 到保底了
      items = [
        general_item,
      ]
    }else if (ctx.role.sgzb.time >= config.PICK_MIN){ // 超过最少抽奖次数,但还没到保底
      items.push(general_item);
    }
    let rates = items.deepMap('W');
    let _item = items[ctx.random.inweight(rates)];
console.error({_item});
    ctx.assert(_item, 'invalid weight');
    // 抽到保底,重置次数
    if (_item.GSID === Number.parseInt(ctx.role.sgzb.pickgsid)) {
      ctx.role.sgzb.time = 0;
      // todo 打印?
    }
    output.push({
      gsid: _item.GSID,
      count: _item.COUNT,
    })
  }
  ctx.role.addItemsNoSave(output);
  ctx.role.markModified('sgzb');
  await ctx.role.save();
  ctx.body = {
    cost,
    items: output,
    got: config.PICK_MAX - ctx.role.sgzb.time,
  }
}